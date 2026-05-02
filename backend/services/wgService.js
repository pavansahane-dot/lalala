const { runRemoteCommand } = require('./sshClient');

/**
 * Add a WireGuard peer on the live server via SSH.
 * Runs: sudo wg set wg0 peer <pubkey> allowed-ips <ip>/32
 * Then persists: sudo wg-quick save wg0
 */
const addWgPeer = async (publicKey, assignedIP, server) => {
    const addCmd = `sudo wg set wg0 peer ${publicKey} allowed-ips ${assignedIP}/32`;
    const saveCmd = 'sudo wg-quick save wg0';

    const addResult = await runRemoteCommand(server, addCmd);
    if (addResult.stderr && addResult.stderr.trim()) {
        // wg sometimes writes non-fatal warnings to stderr — only throw on real errors
        const isWarning = addResult.stderr.toLowerCase().includes('warning');
        if (!isWarning) throw new Error(`wg set failed: ${addResult.stderr}`);
    }

    const saveResult = await runRemoteCommand(server, saveCmd);
    if (saveResult.stderr && saveResult.stderr.trim() && !saveResult.stderr.toLowerCase().includes('warning')) {
        console.warn(`[WG] wg-quick save warning: ${saveResult.stderr}`);
    }

    console.log(`[WG] ✅ Peer added: ${publicKey} → ${assignedIP}/32`);
    return { addResult, saveResult };
};

/**
 * Remove a WireGuard peer from the live server via SSH.
 * Runs: sudo wg set wg0 peer <pubkey> remove
 * Then persists: sudo wg-quick save wg0
 */
const removeWgPeer = async (publicKey, server) => {
    const removeCmd = `sudo wg set wg0 peer ${publicKey} remove`;
    const saveCmd = 'sudo wg-quick save wg0';

    await runRemoteCommand(server, removeCmd);
    await runRemoteCommand(server, saveCmd);

    console.log(`[WG] 🗑️  Peer removed: ${publicKey}`);
};

/**
 * Get current peer list from the server (for diagnostics).
 */
const listWgPeers = async (server) => {
    const result = await runRemoteCommand(server, 'sudo wg show wg0 peers');
    return result.stdout.trim().split('\n').filter(Boolean);
};

module.exports = { addWgPeer, removeWgPeer, listWgPeers };
