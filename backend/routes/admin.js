const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const { prisma, redis } = require('../utils/db');
const { checkSession } = require('../middleware/session');
const { logEvent } = require('../middleware/audit');
const { vpnControl } = require('../services/sshClient');
const { invalidateNetworkGuardCache } = require('../middleware/networkGuard');

// ── Role Guards ──────────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role === 'admin' || role === 'super_admin') return next();
    res.status(403).json({ error: 'Access Denied: Admins Only' });
};

const isSuperAdmin = (req, res, next) => {
    if (req.user?.adminRole === 'super_admin') return next();
    res.status(403).json({ error: 'Access Denied: Super Admins Only' });
};

// ── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', checkSession, isAdmin, async (req, res) => {
    try {
        const [totalUsers, activeSubs, activeNodes] = await Promise.all([
            prisma.user.count(),
            prisma.subscription.count({ where: { status: 'active' } }),
            prisma.server.count({ where: { isActive: true } }),
        ]);
        const activePeers = activeNodes > 0 ? await prisma.vpnPeer.count({ where: { isActive: true } }) : 0;
        res.json({ totalUsers, activeSubs, activeNodes, activePeers, revenue: 0 });
    } catch {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ── Server Management ────────────────────────────────────────────────────────
router.get('/servers', checkSession, isAdmin, async (req, res) => {
    try {
        const servers = await prisma.server.findMany({ orderBy: { lastSeen: 'desc' } });
        res.json(servers);
    } catch {
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

router.post('/servers', checkSession, isAdmin, async (req, res) => {
    try {
        const { country, city, ip, protocol, sshUser, sshPort } = req.body;
        const server = await prisma.server.create({
            data: { country, city, ip, protocol, sshUser, sshPort: sshPort || 22 }
        });
        await logEvent(req.user.userId, 'SERVER_ADDED', req);
        res.status(201).json(server);
    } catch {
        res.status(500).json({ error: 'Failed to create server' });
    }
});

router.patch('/servers/:id', checkSession, isAdmin, async (req, res) => {
    try {
        const { isActive, load, city } = req.body;
        const server = await prisma.server.update({
            where: { id: req.params.id },
            data: {
                ...(isActive !== undefined && { isActive, manualOverride: true }),
                ...(load !== undefined && { load }),
                ...(city !== undefined && { city })
            }
        });
        res.json(server);
    } catch {
        res.status(500).json({ error: 'Failed to update server' });
    }
});

router.delete('/servers/:id', checkSession, isAdmin, async (req, res) => {
    try {
        await prisma.server.delete({ where: { id: req.params.id } });
        await logEvent(req.user.userId, 'SERVER_DELETED', req);
        res.json({ message: 'Server deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete server' });
    }
});

// SSH VPN Control: POST /api/admin/servers/:id/control  body: { action: 'start'|'stop'|'restart'|'status' }
router.post('/servers/:id/control', checkSession, isAdmin, async (req, res) => {
    try {
        const server = await prisma.server.findUnique({ where: { id: req.params.id } });
        if (!server) return res.status(404).json({ error: 'Server not found' });

        const { action } = req.body;
        if (!['start', 'stop', 'restart', 'status', 'stats'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const result = await vpnControl[action](server);
        await logEvent(req.user.userId, `SERVER_${action.toUpperCase()}`, req);
        res.json({ stdout: result.stdout, stderr: result.stderr });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Bandwidth Quota Middleware (attach to any peer-access route) ─────────────
const checkBandwidthQuota = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { peers: { where: { type: 'wireguard' } } }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.bandwidthLimitMb === 0) return next(); // 0 = unlimited

        const usedBytes = user.peers.reduce((s, p) => s + Number(p.bytesRx) + Number(p.bytesTx), 0);
        const usedMb = usedBytes / (1024 * 1024);
        if (usedMb >= user.bandwidthLimitMb) {
            return res.status(429).json({
                error: 'Bandwidth quota exceeded',
                usedMb: Math.round(usedMb),
                limitMb: user.bandwidthLimitMb
            });
        }
        req.bandwidthUsedMb = usedMb;
        next();
    } catch {
        next();
    }
};

// GET /api/admin/users/:id/bandwidth  — quota usage for a specific user
router.get('/users/:id/bandwidth', checkSession, isAdmin, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { peers: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const usedBytes = user.peers.reduce((s, p) => s + Number(p.bytesRx) + Number(p.bytesTx), 0);
        const usedMb = usedBytes / (1024 * 1024);
        const limitMb = user.bandwidthLimitMb;
        const pct = limitMb > 0 ? Math.min(100, (usedMb / limitMb) * 100) : 0;

        res.json({
            usedMb: Math.round(usedMb),
            limitMb,
            pct: Math.round(pct),
            unlimited: limitMb === 0
        });
    } catch {
        res.status(500).json({ error: 'Failed to fetch bandwidth usage' });
    }
});

// ── User Management ──────────────────────────────────────────────────────────
router.get('/users', checkSession, isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, email: true, role: true, adminRole: true,
                plan: true, twoFactorEnabled: true, bandwidthLimitMb: true,
                createdAt: true, subscription: { select: { status: true, expiresAt: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.patch('/users/:id', checkSession, isAdmin, async (req, res) => {
    try {
        const { adminRole, bandwidthLimitMb, plan } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                ...(adminRole !== undefined && { adminRole }),
                ...(bandwidthLimitMb !== undefined && { bandwidthLimitMb }),
                ...(plan !== undefined && { plan })
            }
        });
        await logEvent(req.user.userId, 'USER_UPDATED', req);
        res.json({ id: user.id, email: user.email, adminRole: user.adminRole });
    } catch {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Force-disconnect: ban user session via Redis
router.post('/users/:id/disconnect', checkSession, isAdmin, async (req, res) => {
    try {
        await redis.set(`ban:${req.params.id}`, 'force_disconnect', 'EX', 86400);
        await logEvent(req.user.userId, 'USER_FORCE_DISCONNECTED', req);
        res.json({ message: 'User session revoked' });
    } catch {
        res.status(500).json({ error: 'Failed to disconnect user' });
    }
});

// ── WireGuard Peer Management ────────────────────────────────────────────────
const nacl = require('tweetnacl');

// Generate a WireGuard-compatible Curve25519 key pair
const generateWgKeyPair = () => {
    const keyPair = nacl.box.keyPair();
    const toBase64 = (arr) => Buffer.from(arr).toString('base64');
    return { privateKey: toBase64(keyPair.secretKey), publicKey: toBase64(keyPair.publicKey) };
};

// Build a WireGuard .conf string for a peer
const buildWgConfig = (peer, server, privateKey) => [
    '[Interface]',
    `PrivateKey = ${privateKey}`,
    `Address = ${peer.assignedIp}/32`,
    'DNS = 1.1.1.1, 8.8.8.8',
    '',
    '[Peer]',
    `PublicKey = ${server ? Buffer.from(require('crypto').createHash('sha256').update(server.ip).digest()).toString('base64') : 'SERVER_PUBLIC_KEY'}`,
    `Endpoint = ${server ? server.ip : 'SERVER_IP'}:51820`,
    `AllowedIPs = ${peer.allowedIps}`,
    'PersistentKeepalive = 25',
].join('\n');

router.get('/wireguard', checkSession, isAdmin, async (req, res) => {
    try {
        const peers = await prisma.vpnPeer.findMany({
            where: { type: 'wireguard' },
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(peers);
    } catch {
        res.status(500).json({ error: 'Failed to fetch WireGuard peers' });
    }
});

// Generate a new key pair + peer record for a user
router.post('/wireguard/generate', checkSession, isAdmin, async (req, res) => {
    try {
        const { userId, assignedIp, allowedIps, presharedKey } = req.body;
        if (!userId || !assignedIp) return res.status(400).json({ error: 'userId and assignedIp required' });

        const { privateKey, publicKey } = generateWgKeyPair();
        const psk = presharedKey || Buffer.from(nacl.randomBytes(32)).toString('base64');

        const peer = await prisma.vpnPeer.create({
            data: {
                userId,
                type: 'wireguard',
                publicKey,
                presharedKey: psk,
                allowedIps: allowedIps || '0.0.0.0/0',
                assignedIp,
                isActive: true
            }
        });

        // Fetch first active server to embed in config
        const server = await prisma.server.findFirst({ where: { isActive: true } });
        const configText = buildWgConfig(peer, server, privateKey);

        await logEvent(req.user.userId, 'WIREGUARD_PEER_GENERATED', req);
        // Return peer + privateKey (shown once) + config text for QR
        res.status(201).json({ peer, privateKey, configText });
    } catch (e) {
        res.status(500).json({ error: e.message || 'Failed to generate peer' });
    }
});

router.patch('/wireguard/:id', checkSession, isAdmin, async (req, res) => {
    try {
        const { isActive, allowedIps, splitTunnel } = req.body;
        // splitTunnel: true  => route only VPN subnet (split), false => full tunnel (0.0.0.0/0)
        const resolvedAllowedIps = splitTunnel !== undefined
            ? (splitTunnel ? '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16' : '0.0.0.0/0')
            : allowedIps;
        const peer = await prisma.vpnPeer.update({
            where: { id: req.params.id },
            data: {
                ...(isActive !== undefined && { isActive }),
                ...(resolvedAllowedIps !== undefined && { allowedIps: resolvedAllowedIps })
            }
        });
        res.json(peer);
    } catch {
        res.status(500).json({ error: 'Failed to update peer' });
    }
});

router.delete('/wireguard/:id', checkSession, isAdmin, async (req, res) => {
    try {
        await prisma.vpnPeer.delete({ where: { id: req.params.id } });
        await logEvent(req.user.userId, 'WIREGUARD_PEER_DELETED', req);
        res.json({ message: 'Peer deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete peer' });
    }
});

// ── OpenVPN Certificate Management ──────────────────────────────────────────
// Download a .ovpn config stub for a cert
router.get('/openvpn/:id/download', checkSession, isAdmin, async (req, res) => {
    try {
        const cert = await prisma.openVpnCert.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });
        if (!cert) return res.status(404).json({ error: 'Cert not found' });
        if (cert.isRevoked) return res.status(403).json({ error: 'Certificate is revoked' });

        const server = await prisma.server.findFirst({ where: { isActive: true } });
        const ovpn = [
            'client',
            'dev tun',
            'proto udp',
            `remote ${server ? server.ip : 'SERVER_IP'} 1194`,
            'resolv-retry infinite',
            'nobind',
            'persist-key',
            'persist-tun',
            'remote-cert-tls server',
            'cipher AES-256-GCM',
            'auth SHA256',
            'verb 3',
            `# Cert: ${cert.certName}`,
            `# CN: ${cert.commonName}`,
            `# User: ${cert.user.email}`,
            `# Expires: ${cert.expiresAt.toISOString()}`,
            '# <ca> ... </ca>',
            '# <cert> ... </cert>',
            '# <key> ... </key>',
        ].join('\n');

        res.setHeader('Content-Disposition', `attachment; filename=${cert.certName}.ovpn`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(ovpn);
    } catch {
        res.status(500).json({ error: 'Failed to generate .ovpn' });
    }
});

router.get('/openvpn', checkSession, isAdmin, async (req, res) => {
    try {
        const certs = await prisma.openVpnCert.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(certs);
    } catch {
        res.status(500).json({ error: 'Failed to fetch certs' });
    }
});

router.post('/openvpn', checkSession, isAdmin, async (req, res) => {
    try {
        const { userId, certName, commonName, expiresAt } = req.body;
        const cert = await prisma.openVpnCert.create({
            data: { userId, certName, commonName, expiresAt: new Date(expiresAt) }
        });
        await logEvent(req.user.userId, 'OPENVPN_CERT_ISSUED', req);
        res.status(201).json(cert);
    } catch {
        res.status(500).json({ error: 'Failed to issue cert' });
    }
});

router.post('/openvpn/:id/revoke', checkSession, isAdmin, async (req, res) => {
    try {
        const cert = await prisma.openVpnCert.update({
            where: { id: req.params.id },
            data: { isRevoked: true, revokedAt: new Date() }
        });
        await logEvent(req.user.userId, 'OPENVPN_CERT_REVOKED', req);
        res.json(cert);
    } catch {
        res.status(500).json({ error: 'Failed to revoke cert' });
    }
});

// ── System Settings ──────────────────────────────────────────────────────────
router.get('/settings', checkSession, isAdmin, async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Return as key→value map
        const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
        res.json(map);
    } catch {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/settings', checkSession, isAdmin, async (req, res) => {
    try {
        const entries = Object.entries(req.body); // { key: value, ... }
        await Promise.all(entries.map(([key, value]) =>
            prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            })
        ));
        await logEvent(req.user.userId, 'SYSTEM_SETTINGS_UPDATED', req);
        invalidateNetworkGuardCache();
        res.json({ message: 'Settings saved' });
    } catch {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// ── Alert Rules ──────────────────────────────────────────────────────────────
router.get('/alerts', checkSession, isAdmin, async (req, res) => {
    try {
        const alerts = await prisma.alertRule.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(alerts);
    } catch {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

router.post('/alerts', checkSession, isAdmin, async (req, res) => {
    try {
        const { type, target, threshold } = req.body;
        const alert = await prisma.alertRule.create({ data: { type, target, threshold } });
        res.status(201).json(alert);
    } catch {
        res.status(500).json({ error: 'Failed to create alert' });
    }
});

router.patch('/alerts/:id', checkSession, isAdmin, async (req, res) => {
    try {
        const { isEnabled, threshold } = req.body;
        const alert = await prisma.alertRule.update({
            where: { id: req.params.id },
            data: {
                ...(isEnabled !== undefined && { isEnabled }),
                ...(threshold !== undefined && { threshold })
            }
        });
        res.json(alert);
    } catch {
        res.status(500).json({ error: 'Failed to update alert' });
    }
});

// ── Audit Logs ───────────────────────────────────────────────────────────────
router.get('/audit', checkSession, isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, severity } = req.query;
        const where = severity ? { severity } : {};
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: { user: { select: { email: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit)
            }),
            prisma.auditLog.count({ where })
        ]);
        res.json({ logs, total, page: Number(page) });
    } catch {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// ── 2FA Management (Admin self-enroll) ──────────────────────────────────────
router.post('/2fa/setup', checkSession, async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({ name: `ZeroTraceVPN (${req.user.userId})` });
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { twoFactorSecret: secret.base32 }
        });
        res.json({ otpauthUrl: secret.otpauth_url, base32: secret.base32 });
    } catch {
        res.status(500).json({ error: '2FA setup failed' });
    }
});

router.post('/2fa/verify', checkSession, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.twoFactorSecret) return res.status(400).json({ error: '2FA not set up' });

        const valid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (!valid) return res.status(400).json({ error: 'Invalid TOTP token' });

        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorEnabled: true }
        });
        res.json({ message: '2FA enabled successfully' });
    } catch {
        res.status(500).json({ error: '2FA verification failed' });
    }
});

module.exports = router;
module.exports.checkBandwidthQuota = checkBandwidthQuota;
