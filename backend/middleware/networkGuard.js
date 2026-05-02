const { prisma } = require('../utils/db');
const { logEvent } = require('../middleware/audit');

// Cache settings for 30s to avoid DB hit on every request
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 30000;

const getSettings = async () => {
    if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
    const rows = await prisma.systemSetting.findMany();
    _cache = Object.fromEntries(rows.map(r => [r.key, r.value]));
    _cacheAt = Date.now();
    return _cache;
};

const parseList = (str) =>
    (str || '').split(',').map(s => s.trim()).filter(Boolean);

const getClientIp = (req) =>
    (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();

/**
 * networkGuard middleware
 * Reads ip_whitelist, ip_blacklist, geo_block_enabled from SystemSetting.
 * Blocks or allows the request accordingly.
 */
const networkGuard = async (req, res, next) => {
    try {
        const settings = await getSettings();
        const clientIp = getClientIp(req);

        // 1. IP Blacklist — always block regardless of whitelist
        const blacklist = parseList(settings.ip_blacklist);
        if (blacklist.length && blacklist.includes(clientIp)) {
            await logEvent('SYSTEM', 'IP_BLACKLISTED_BLOCKED', req, {
                severity: 'warn',
                metadata: { ip: clientIp }
            });
            return res.status(403).json({ error: 'Access denied: your IP is blocked.' });
        }

        // 2. IP Whitelist — if set, only allow listed IPs
        const whitelist = parseList(settings.ip_whitelist);
        if (whitelist.length && !whitelist.includes(clientIp)) {
            await logEvent('SYSTEM', 'IP_NOT_WHITELISTED_BLOCKED', req, {
                severity: 'warn',
                metadata: { ip: clientIp }
            });
            return res.status(403).json({ error: 'Access denied: IP not whitelisted.' });
        }

        // 3. GeoIP block concept — flag in settings, actual geo lookup requires
        //    an external service (e.g. ip-api.com). Here we log the intent.
        if (settings.geo_block_enabled === 'true') {
            // Placeholder: in production, call ip-api.com/json/{ip} and check country
            // For now we just attach the flag to req for downstream use
            req.geoBlockEnabled = true;
        }

        next();
    } catch (e) {
        // Never block traffic due to a guard error — fail open
        console.error('[NetworkGuard] Error:', e.message);
        next();
    }
};

// Invalidate cache when settings are updated
const invalidateNetworkGuardCache = () => { _cache = null; };

module.exports = { networkGuard, invalidateNetworkGuardCache };
