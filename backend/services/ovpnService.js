const archiver = require('archiver');

// Ports/protocols to bundle
const OVPN_PORTS = [
    { proto: 'tcp', port: '80' },
    { proto: 'tcp', port: '443' },
    { proto: 'udp', port: '53' },
    { proto: 'udp', port: '1194' },
];

/**
 * Build a single .ovpn config string for a given server + port/proto.
 * In production, embed the real CA cert from the server's /etc/openvpn/ca.crt
 * For now we embed a placeholder that clearly instructs the user.
 */
const buildOvpnConfig = (server, proto, port, caCert) => {
    const serverName = `${server.city}-${server.country}`.toLowerCase().replace(/\s+/g, '-');
    return [
        'client',
        'dev tun',
        `proto ${proto}`,
        `remote ${server.ip} ${port}`,
        'resolv-retry infinite',
        'nobind',
        'persist-key',
        'persist-tun',
        'remote-cert-tls server',
        'cipher AES-256-GCM',
        'auth SHA256',
        'compress lz4-v2',
        'auth-user-pass credentials.txt',
        'verb 3',
        `# ZeroTraceVPN — ${serverName}`,
        `# Port: ${proto.toUpperCase()} ${port}`,
        `# Generated: ${new Date().toISOString()}`,
        '<ca>',
        caCert || '# CA certificate — replace with actual ca.crt content from server',
        '</ca>',
    ].join('\n');
};

/**
 * Fetch the CA cert from the server via SSH (optional — falls back to placeholder).
 */
const fetchCaCert = async (server) => {
    try {
        const { runRemoteCommand } = require('./sshClient');
        const result = await runRemoteCommand(server, 'sudo cat /etc/openvpn/ca.crt 2>/dev/null || echo ""');
        const cert = result.stdout.trim();
        return cert.startsWith('-----BEGIN') ? cert : null;
    } catch {
        return null;
    }
};

/**
 * Stream a ZIP archive containing:
 *   - zerotrace-<city>-tcp80.ovpn
 *   - zerotrace-<city>-tcp443.ovpn
 *   - zerotrace-<city>-udp53.ovpn
 *   - zerotrace-<city>-udp1194.ovpn
 *   - credentials.txt  (username\npassword)
 *   - README.txt
 *
 * @param {object} server  - Server DB record
 * @param {string} username
 * @param {string} password
 * @param {object} res     - Express response object (we pipe into it)
 */
const streamOvpnZip = async (server, username, password, res) => {
    const citySlug = server.city.toLowerCase().replace(/\s+/g, '-');

    // Try to fetch real CA cert via SSH; fall back to placeholder
    const caCert = await fetchCaCert(server);

    const archive = archiver('zip', { zlib: { level: 6 } });

    archive.on('error', (err) => {
        console.error('[OVPN ZIP] Archive error:', err.message);
        if (!res.headersSent) res.status(500).json({ error: 'ZIP generation failed' });
    });

    res.setHeader('Content-Disposition', `attachment; filename=zerotrace-openvpn-${citySlug}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    // Add one .ovpn per port
    for (const { proto, port } of OVPN_PORTS) {
        const config = buildOvpnConfig(server, proto, port, caCert);
        archive.append(config, { name: `zerotrace-${citySlug}-${proto}${port}.ovpn` });
    }

    // credentials.txt — OpenVPN reads line 1 as user, line 2 as pass
    archive.append(`${username}\n${password}\n`, { name: 'credentials.txt' });

    // README
    const readme = [
        'ZeroTraceVPN — OpenVPN Bundle',
        '================================',
        `Server: ${server.city}, ${server.country}`,
        `IP: ${server.ip}`,
        '',
        'Files included:',
        '  - zerotrace-*-tcp80.ovpn   (TCP port 80  — works through most firewalls)',
        '  - zerotrace-*-tcp443.ovpn  (TCP port 443 — HTTPS port, very reliable)',
        '  - zerotrace-*-udp53.ovpn   (UDP port 53  — DNS port bypass)',
        '  - zerotrace-*-udp1194.ovpn (UDP port 1194 — standard OpenVPN)',
        '  - credentials.txt          (auto-loaded by the configs above)',
        '',
        'Usage:',
        '  1. Install OpenVPN client (https://openvpn.net/community-downloads/)',
        '  2. Import any .ovpn file',
        '  3. Connect — credentials are loaded automatically',
        '',
        `Generated: ${new Date().toISOString()}`,
        'ZeroTraceVPN — No Logs. No Ads. No Compromise.',
    ].join('\n');

    archive.append(readme, { name: 'README.txt' });

    await archive.finalize();
};

module.exports = { streamOvpnZip, buildOvpnConfig, OVPN_PORTS };
