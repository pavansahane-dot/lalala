const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs'); // Added filesystem check
const ssh = new NodeSSH();

const registerVpnPeer = async (clientPublicKey, clientIp) => {
    const keyPath = path.join(__dirname, '../keys/aws_key.pem');
    
    // Check if the file actually exists before even trying SSH
    if (!fs.existsSync(keyPath)) {
        console.error(`[FATAL] Key file NOT found at: ${keyPath}`);
        throw new Error('SSH Key file missing');
    }

    try {
        const host = (process.env.WG_SERVER_IP || '').split(':')[0];
        if (!host) throw new Error('WG_SERVER_IP is not set in environment');

        await ssh.connect({
            host,
            username: 'ubuntu',
            privateKeyPath: keyPath
        });

        console.log(`[SSH] ✅ Connected to AWS`);

        const command = `sudo wg set wg0 peer ${clientPublicKey} allowed-ips ${clientIp}/32`;
        await ssh.execCommand(command);
        
        ssh.dispose();
    } catch (error) {
        console.error('[SSH ERROR]:', error.message);
        throw error; 
    }
};

module.exports = { registerVpnPeer };