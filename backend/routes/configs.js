const express = require('express');
const router = express.Router();
const nacl = require('tweetnacl');
const { checkSession } = require('../middleware/session');
const { prisma } = require('../utils/db');
const { logEvent } = require('../middleware/audit');

const generateWgKeyPair = () => {
    const kp = nacl.box.keyPair();
    return {
        privateKey: Buffer.from(kp.secretKey).toString('base64'),
        publicKey: Buffer.from(kp.publicKey).toString('base64'),
    };
};

// GET /api/configs/peers  — list logged-in user's WireGuard peers
router.get('/peers', checkSession, async (req, res) => {
    try {
        const peers = await prisma.vpnPeer.findMany({
            where: { userId: req.user.userId, type: 'wireguard', isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(peers.map(p => ({ ...p, bytesRx: p.bytesRx.toString(), bytesTx: p.bytesTx.toString() })));
    } catch {
        res.status(500).json({ error: 'Failed to fetch peers' });
    }
});

// POST /api/configs/generate/:serverId  — create a new peer + return .conf
router.post('/generate/:serverId', checkSession, async (req, res) => {
    try {
        const server = await prisma.server.findUnique({ where: { id: req.params.serverId } });
        if (!server) return res.status(404).json({ error: 'Server not found' });
        if (!server.isActive) return res.status(400).json({ error: 'Server is offline' });

        const { privateKey, publicKey } = generateWgKeyPair();
        const psk = Buffer.from(nacl.randomBytes(32)).toString('base64');

        // Assign next available IP in 10.8.0.0/24
        const existing = await prisma.vpnPeer.findMany({ select: { assignedIp: true } });
        const usedLast = existing.map(p => {
            const parts = p.assignedIp.split('.');
            return parseInt(parts[3]) || 0;
        });
        const nextLast = Math.max(1, ...usedLast) + 1;
        if (nextLast > 254) return res.status(400).json({ error: 'IP pool exhausted' });
        const assignedIp = `10.8.0.${nextLast}`;

        const peer = await prisma.vpnPeer.create({
            data: {
                userId: req.user.userId,
                type: 'wireguard',
                publicKey,
                presharedKey: psk,
                allowedIps: '0.0.0.0/0',
                assignedIp,
                isActive: true,
            }
        });

        await logEvent(req.user.userId, 'CONFIG_GENERATED', req);

        const serverPubKey = process.env.WG_SERVER_PUBLIC_KEY || '<server-public-key>';
        const endpoint = process.env.WG_SERVER_IP || `${server.ip}:51820`;

        const configText = [
            '[Interface]',
            `# ZeroTraceVPN — ${server.city}, ${server.country}`,
            `# Generated: ${new Date().toISOString()}`,
            `PrivateKey = ${privateKey}`,
            `Address = ${assignedIp}/32`,
            'DNS = 1.1.1.1, 8.8.8.8',
            '',
            '[Peer]',
            `PublicKey = ${serverPubKey}`,
            `PresharedKey = ${psk}`,
            `Endpoint = ${endpoint}`,
            'AllowedIPs = 0.0.0.0/0',
            'PersistentKeepalive = 25',
        ].join('\n');

        res.json({
            peer: { ...peer, bytesRx: peer.bytesRx.toString(), bytesTx: peer.bytesTx.toString() },
            configText,
            privateKey
        });
    } catch (e) {
        console.error('[CONFIG ERROR]', e);
        res.status(500).json({ error: e.message || 'Failed to generate configuration' });
    }
});

// GET /api/configs/download/:serverId  — legacy single-file download (kept for backward compat)
router.get('/download/:serverId', checkSession, async (req, res) => {
    try {
        const server = await prisma.server.findUnique({ where: { id: req.params.serverId } });
        if (!server) return res.status(404).json({ error: 'Server not found' });

        const { privateKey, publicKey } = generateWgKeyPair();
        const psk = Buffer.from(nacl.randomBytes(32)).toString('base64');

        const existing = await prisma.vpnPeer.findMany({ select: { assignedIp: true } });
        const usedLast = existing.map(p => parseInt(p.assignedIp.split('.')[3]) || 0);
        const nextLast = Math.max(1, ...usedLast) + 1;
        const assignedIp = nextLast <= 254 ? `10.8.0.${nextLast}` : '10.8.0.2';

        await prisma.vpnPeer.create({
            data: { userId: req.user.userId, type: 'wireguard', publicKey, presharedKey: psk, allowedIps: '0.0.0.0/0', assignedIp, isActive: true }
        });

        const configText = [
            '[Interface]',
            `PrivateKey = ${privateKey}`,
            `Address = ${assignedIp}/32`,
            'DNS = 1.1.1.1, 8.8.8.8',
            '',
            '[Peer]',
            `PublicKey = ${process.env.WG_SERVER_PUBLIC_KEY || '<server-public-key>'}`,
            `PresharedKey = ${psk}`,
            `Endpoint = ${process.env.WG_SERVER_IP || server.ip + ':51820'}`,
            'AllowedIPs = 0.0.0.0/0',
            'PersistentKeepalive = 25',
        ].join('\n');

        res.setHeader('Content-Disposition', `attachment; filename=zerotrace-${server.city.toLowerCase()}.conf`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(configText);
    } catch (e) {
        res.status(500).json({ error: 'Failed to generate configuration' });
    }
});

module.exports = router;
