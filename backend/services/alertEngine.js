const { prisma } = require('../utils/db');
const { logEvent } = require('../middleware/audit');

let _io = null;

const emit = (event, data) => {
    if (_io) _io.emit(event, data);
};

// ── Individual rule checkers ─────────────────────────────────────────────────

const checkServerDown = async (rule) => {
    const server = await prisma.server.findUnique({ where: { id: rule.target } });
    if (!server) return false;
    return !server.isActive;
};

const checkCertExpiry = async (rule) => {
    const cert = await prisma.openVpnCert.findUnique({ where: { id: rule.target } });
    if (!cert || cert.isRevoked) return false;
    const daysLeft = Math.ceil((new Date(cert.expiresAt).getTime() - Date.now()) / 86400000);
    const threshold = rule.threshold ?? 30;
    return daysLeft <= threshold && daysLeft >= 0;
};

const checkBandwidthExceeded = async (rule) => {
    const user = await prisma.user.findUnique({
        where: { id: rule.target },
        include: { peers: true }
    });
    if (!user || user.bandwidthLimitMb === 0) return false;
    const usedMb = user.peers.reduce((s, p) => s + Number(p.bytesRx) + Number(p.bytesTx), 0) / (1024 * 1024);
    const threshold = rule.threshold ?? user.bandwidthLimitMb;
    return usedMb >= threshold;
};

const CHECKERS = {
    server_down:         checkServerDown,
    cert_expiry:         checkCertExpiry,
    bandwidth_exceeded:  checkBandwidthExceeded,
};

// ── Main poller ──────────────────────────────────────────────────────────────

const runAlertEngine = async () => {
    const rules = await prisma.alertRule.findMany({ where: { isEnabled: true } });

    for (const rule of rules) {
        try {
            const checker = CHECKERS[rule.type];
            if (!checker) continue;

            const fired = await checker(rule);
            if (!fired) continue;

            // Debounce: don't re-fire within 10 minutes
            if (rule.lastFiredAt) {
                const msSince = Date.now() - new Date(rule.lastFiredAt).getTime();
                if (msSince < 10 * 60 * 1000) continue;
            }

            // Update lastFiredAt
            await prisma.alertRule.update({
                where: { id: rule.id },
                data: { lastFiredAt: new Date() }
            });

            const payload = {
                ruleId: rule.id,
                type: rule.type,
                target: rule.target,
                threshold: rule.threshold,
                firedAt: new Date().toISOString()
            };

            // Write critical audit log (system event — no req object)
            await logEvent('SYSTEM', `ALERT_FIRED:${rule.type.toUpperCase()}`, null, {
                severity: 'critical',
                metadata: payload
            });

            // Broadcast to all admin dashboards via Socket.io
            emit('alert:fired', payload);

            console.log(`[AlertEngine] 🚨 FIRED — ${rule.type} on target ${rule.target}`);
        } catch (e) {
            console.error(`[AlertEngine] Error checking rule ${rule.id}:`, e.message);
        }
    }
};

const startAlertEngine = (io) => {
    _io = io;
    // Run immediately then every 60s
    runAlertEngine();
    setInterval(runAlertEngine, 60000);
    console.log('🚨 Alert Engine started — polling every 60s');
};

module.exports = { startAlertEngine };
