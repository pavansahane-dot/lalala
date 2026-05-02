const { prisma } = require('../utils/db');
const axios = require('axios');
const net = require('net');

/**
 * Attempts a TCP handshake on the given host:port.
 * Resolves true if the port accepts a connection, false otherwise.
 * This is used as a fallback liveness check when HTTP health endpoint is unavailable.
 */
const tcpPing = (host, port, timeoutMs = 5000) =>
    new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeoutMs);
        socket
            .once('connect', () => { socket.destroy(); resolve(true); })
            .once('timeout', () => { socket.destroy(); resolve(false); })
            .once('error', () => { socket.destroy(); resolve(false); })
            .connect(port, host);
    });

const runHealthCheck = async () => {
    // --- MAINTENANCE MODE ---
    // Set HEALTH_CHECK_MAINTENANCE=true in .env to keep all servers ONLINE
    // in the DB regardless of actual reachability. Use this while configuring
    // AWS Security Groups or during planned maintenance windows.
    if (process.env.HEALTH_CHECK_MAINTENANCE === 'true') {
        console.log('[Network Monitor] ⚠️  MAINTENANCE MODE active — skipping probes, all nodes kept ONLINE.');
        return;
    }

    console.log('--- [Network Monitor] Starting Server Heartbeat ---');
    const servers = await prisma.server.findMany();

    for (const server of servers) {
        // Skip servers that an admin has explicitly toggled — never auto-override them
        if (server.manualOverride) {
            console.log(`⚙️  ${server.city} (${server.ip}): skipped — manual override active`);
            continue;
        }

        const host = server.ip.split(':')[0];
        let isOnline = false;
        let method = '';

        // --- Probe 1: HTTP health endpoint on port 8080 ---
        try {
            console.log(`🔍 [HTTP]  Probing ${server.city} (${host}):8080/health ...`);
            const res = await axios.get(`http://${host}:8080/health`, {
                timeout: 10000,
                headers: { 'User-Agent': 'ZeroTraceVpn-HealthCheck/1.0' }
            });
            isOnline = res.status >= 200 && res.status < 400;
            method = `HTTP ${res.status}`;
        } catch (httpErr) {
            const reason =
                httpErr.code === 'ECONNREFUSED' ? 'port 8080 refused' :
                httpErr.code === 'ETIMEDOUT'    ? 'HTTP timed out (10s)' :
                httpErr.code === 'ENOTFOUND'    ? 'DNS resolution failed' :
                httpErr.response               ? `HTTP ${httpErr.response.status}` :
                httpErr.message;

            console.log(`   └─ HTTP probe failed: ${reason}`);

            // --- Probe 2: TCP ping on port 22 (SSH) as liveness fallback ---
            console.log(`🔍 [TCP]   Fallback — probing ${server.city} (${host}):22 ...`);
            isOnline = await tcpPing(host, 22);
            method = isOnline ? 'TCP:22 reachable' : 'TCP:22 unreachable';
        }

        if (isOnline) {
            console.log(`✅ ${server.city} (${host}): ONLINE via ${method}`);
            await prisma.server.update({
                where: { id: server.id },
                data: { isActive: true, lastSeen: new Date() }
            });
        } else {
            console.log(`❌ ${server.city} (${host}): OFFLINE — ${method}`);
            console.log(`   └─ Tip: ensure port 8080 (HTTP) or port 22 (SSH) is open in your AWS Security Group.`);
            await prisma.server.update({
                where: { id: server.id },
                data: { isActive: false }
            });
        }
    }

    console.log('--- [Network Monitor] Heartbeat complete ---');
};

const startHealthMonitoring = () => {
    runHealthCheck();
    setInterval(runHealthCheck, 60000);
};

module.exports = { startHealthMonitoring };
