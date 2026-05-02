const express = require('express');
const router = express.Router();
const nacl = require('tweetnacl');
const { prisma } = require('../utils/db');
const { checkSession } = require('../middleware/session');
const { addWgPeer, removeWgPeer } = require('../services/wgService');
const { streamOvpnZip } = require('../services/ovpnService');

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateWgKeyPair = () => {
    const kp = nacl.box.keyPair();
    return {
        privateKey: Buffer.from(kp.secretKey).toString('base64'),
        publicKey: Buffer.from(kp.publicKey).toString('base64'),
    };
};

const nextAssignedIP = async () => {
    const peers = await prisma.userDevice.findMany({
        select: { assignedIP: true },
        where: { assignedIP: { not: null } }
    });
    const used = peers.map(p => parseInt(p.assignedIP.split('.')[3]) || 0);
    const next = Math.max(10, ...used) + 1;
    if (next > 254) throw new Error('IP pool exhausted');
    return `10.9.0.${next}`;
};

// ─── Public Routes ───────────────────────────────────────────────────────────

// GET /api/vpn/servers
router.get('/servers', async (req, res) => {
    try {
        const servers = await prisma.server.findMany({
            where: { isActive: true },
            select: { id: true, country: true, city: true, ip: true, protocol: true, load: true, cpuUsage: true, lastSeen: true }
        });
        res.json(servers);
    } catch {
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

// GET /api/vpn/credentials
router.get('/credentials', async (req, res) => {
    try {
        const creds = await prisma.vpnCredentials.findFirst({ where: { protocol: 'openvpn' } });
        if (!creds) return res.json({ username: 'zerotrace', password: 'd4m4idk4di' });
        res.json({ username: creds.username, password: creds.password });
    } catch {
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
});

// GET /api/vpn/config/openvpn?serverId=&port=&proto=  — single .ovpn download
router.get('/config/openvpn', async (req, res) => {
    try {
        const { serverId, port = '1194', proto = 'udp' } = req.query;
        const server = serverId
            ? await prisma.server.findUnique({ where: { id: String(serverId) } })
            : await prisma.server.findFirst({ where: { isActive: true } });
        if (!server) return res.status(404).json({ error: 'No active server found' });

        const creds = await prisma.vpnCredentials.findFirst({ where: { protocol: 'openvpn' } });
        const { buildOvpnConfig } = require('../services/ovpnService');
        const ovpn = buildOvpnConfig(server, proto, port, null);

        const filename = `zerotrace-${server.city.toLowerCase().replace(/\s+/g, '-')}-${proto}${port}.ovpn`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(ovpn);
    } catch {
        res.status(500).json({ error: 'Failed to generate OpenVPN config' });
    }
});

// GET /api/vpn/config/openvpn/zip?serverId=  — full ZIP bundle (all 4 ports)
router.get('/config/openvpn/zip', async (req, res) => {
    try {
        const { serverId } = req.query;
        const server = serverId
            ? await prisma.server.findUnique({ where: { id: String(serverId) } })
            : await prisma.server.findFirst({ where: { isActive: true } });
        if (!server) return res.status(404).json({ error: 'No active server found' });

        const creds = await prisma.vpnCredentials.findFirst({ where: { protocol: 'openvpn' } });
        const username = creds?.username || 'vpnbook';
        const password = creds?.password || 'free2024';

        await streamOvpnZip(server, username, password, res);
    } catch (e) {
        if (!res.headersSent) res.status(500).json({ error: e.message || 'ZIP generation failed' });
    }
});

// POST /api/vpn/config/wireguard — generate WG config, save device, add peer on server
router.post('/config/wireguard', async (req, res) => {
    try {
        const { serverId, deviceName = 'My Device', userId = null } = req.body;

        const server = serverId
            ? await prisma.server.findUnique({ where: { id: String(serverId) } })
            : await prisma.server.findFirst({ where: { isActive: true } });
        if (!server) return res.status(404).json({ error: 'No active server found' });

        const { privateKey, publicKey } = generateWgKeyPair();
        const assignedIP = await nextAssignedIP();

        // Save device to DB first so we have an ID
        const device = await prisma.userDevice.create({
            data: { userId, deviceName, protocol: 'wireguard', serverId: server.id, wgPublicKey: publicKey, wgPrivateKey: privateKey, assignedIP }
        });

        // SSH: add peer on live WireGuard server
        let sshError = null;
        try {
            await addWgPeer(publicKey, assignedIP, server);
        } catch (e) {
            sshError = e.message;
            console.error(`[VPN] SSH peer add failed (device saved anyway): ${e.message}`);
        }

        const serverPubKey = process.env.WG_SERVER_PUBLIC_KEY || '<server-public-key>';
        const endpoint = process.env.WG_SERVER_IP || `${server.ip}:51820`;

        const configText = [
            '[Interface]',
            `# ZeroTraceVPN — ${server.city}, ${server.country}`,
            `# Device: ${deviceName}`,
            `# Generated: ${new Date().toISOString()}`,
            `PrivateKey = ${privateKey}`,
            `Address = ${assignedIP}/32`,
            'DNS = 1.1.1.1, 8.8.8.8',
            '',
            '[Peer]',
            `PublicKey = ${serverPubKey}`,
            `Endpoint = ${endpoint}`,
            'AllowedIPs = 0.0.0.0/0',
            'PersistentKeepalive = 25',
        ].join('\n');

        res.json({
            deviceId: device.id,
            configText,
            assignedIP,
            publicKey,
            sshStatus: sshError ? `warning: ${sshError}` : 'peer registered on server'
        });
    } catch (e) {
        res.status(500).json({ error: e.message || 'Failed to generate WireGuard config' });
    }
});

// GET /api/vpn/config/wireguard/qr?deviceId=  — return QR as base64 PNG
router.get('/config/wireguard/qr', async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

        const device = await prisma.userDevice.findUnique({ where: { id: String(deviceId) } });
        if (!device || !device.wgPrivateKey) return res.status(404).json({ error: 'Device not found' });

        const server = await prisma.server.findUnique({ where: { id: device.serverId } });
        const serverPubKey = process.env.WG_SERVER_PUBLIC_KEY || '<server-public-key>';
        const endpoint = process.env.WG_SERVER_IP || `${server?.ip}:51820`;

        const configText = [
            '[Interface]',
            `PrivateKey = ${device.wgPrivateKey}`,
            `Address = ${device.assignedIP}/32`,
            'DNS = 1.1.1.1, 8.8.8.8',
            '',
            '[Peer]',
            `PublicKey = ${serverPubKey}`,
            `Endpoint = ${endpoint}`,
            'AllowedIPs = 0.0.0.0/0',
            'PersistentKeepalive = 25',
        ].join('\n');

        const QRCode = require('qrcode');
        const qrDataUrl = await QRCode.toDataURL(configText, { width: 300, margin: 2 });
        res.json({ qr: qrDataUrl, configText });
    } catch (e) {
        res.status(500).json({ error: e.message || 'Failed to generate QR code' });
    }
});

// ─── Authenticated Routes ────────────────────────────────────────────────────

// GET /api/vpn/user/devices
router.get('/user/devices', checkSession, async (req, res) => {
    try {
        const devices = await prisma.userDevice.findMany({
            where: { userId: req.user.userId, isRevoked: false },
            orderBy: { createdAt: 'desc' }
        });
        res.json(devices);
    } catch {
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// DELETE /api/vpn/user/devices/:id — revoke + remove peer from server
router.delete('/user/devices/:id', checkSession, async (req, res) => {
    try {
        const device = await prisma.userDevice.findUnique({ where: { id: req.params.id } });
        if (!device || device.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // Mark revoked in DB
        await prisma.userDevice.update({ where: { id: req.params.id }, data: { isRevoked: true } });

        // Also deactivate the matching VpnPeer record
        if (device.wgPublicKey) {
            await prisma.vpnPeer.updateMany({
                where: { publicKey: device.wgPublicKey },
                data: { isActive: false }
            });
        }

        // SSH: remove peer from live WireGuard server (best-effort)
        if (device.protocol === 'wireguard' && device.wgPublicKey) {
            try {
                const server = await prisma.server.findUnique({ where: { id: device.serverId } });
                if (server) await removeWgPeer(device.wgPublicKey, server);
            } catch (e) {
                console.error(`[VPN] SSH peer remove failed (DB already revoked): ${e.message}`);
            }
        }

        res.json({ message: 'Device revoked' });
    } catch {
        res.status(500).json({ error: 'Failed to revoke device' });
    }
});

// GET /api/vpn/user/bandwidth
router.get('/user/bandwidth', checkSession, async (req, res) => {
    try {
        const logs = await prisma.bandwidthLog.findMany({ where: { userId: req.user.userId } });
        const totalUp = logs.reduce((s, l) => s + Number(l.bytesUp), 0);
        const totalDown = logs.reduce((s, l) => s + Number(l.bytesDown), 0);
        res.json({
            totalUp,
            totalDown,
            totalUpMb: (totalUp / 1e6).toFixed(2),
            totalDownMb: (totalDown / 1e6).toFixed(2)
        });
    } catch {
        res.status(500).json({ error: 'Failed to fetch bandwidth' });
    }
});

module.exports = router;
