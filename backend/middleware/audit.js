const { prisma } = require('../utils/db');

/**
 * Utility to log security events
 * @param {string} userId
 * @param {string} action
 * @param {object} req - Express request (or null for system events)
 * @param {object} [opts] - { severity: 'info'|'warn'|'critical', metadata: object }
 */
const logEvent = async (userId, action, req, opts = {}) => {
    try {
        const ipAddress = req
            ? (req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'system')
            : 'system';

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                ipAddress: String(ipAddress),
                severity: opts.severity || 'info',
                metadata: opts.metadata ? JSON.stringify(opts.metadata) : null
            }
        });
        console.log(`[AUDIT] [${opts.severity || 'info'}] ${action} — user ${userId}`);
    } catch (error) {
        console.error('[AUDIT ERROR]', error.message);
    }
};

module.exports = { logEvent };