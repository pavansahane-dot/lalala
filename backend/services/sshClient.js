const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

/**
 * Executes a remote command on a VPN server via SSH.
 * @param {object} server - Server record from DB { ip, sshUser, sshPort }
 * @param {string} command - Shell command to run
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
const runRemoteCommand = async (server, command) => {
    const ssh = new NodeSSH();
    const keyPath = path.join(__dirname, '../keys/aws_key.pem');

    if (!fs.existsSync(keyPath)) {
        throw new Error(`SSH key not found at ${keyPath}`);
    }

    const host = server.ip.split(':')[0];
    const username = server.sshUser || 'ubuntu';
    const port = server.sshPort || 22;

    await ssh.connect({ host, username, port, privateKeyPath: keyPath });

    try {
        const result = await ssh.execCommand(command);
        return result;
    } finally {
        ssh.dispose();
    }
};

/**
 * VPN service control helpers
 */
const vpnControl = {
    start:   (server) => runRemoteCommand(server, 'sudo systemctl start wg-quick@wg0 || sudo systemctl start openvpn'),
    stop:    (server) => runRemoteCommand(server, 'sudo systemctl stop wg-quick@wg0 || sudo systemctl stop openvpn'),
    restart: (server) => runRemoteCommand(server, 'sudo systemctl restart wg-quick@wg0 || sudo systemctl restart openvpn'),
    status:  (server) => runRemoteCommand(server, 'sudo systemctl is-active wg-quick@wg0; sudo systemctl is-active openvpn'),
    stats:   (server) => runRemoteCommand(server, "top -bn1 | grep 'Cpu\\|Mem' | head -4"),
};

module.exports = { runRemoteCommand, vpnControl };
