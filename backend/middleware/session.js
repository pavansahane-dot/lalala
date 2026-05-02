const jwt = require('jsonwebtoken');
const { redis } = require('../utils/db');

/**
 * checkSession Middleware
 * This is the ultimate security layer for your VPN platform.
 * It verifies:
 * 1. The JWT is mathematically valid.
 * 2. The specific token hasn't been blacklisted (Logout).
 * 3. The User ID hasn't been globally banned (Admin Kill Switch).
 */
const checkSession = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // 1. Verify JWT Signature and Expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded; // Attach user info (id, role) to the request object

        // 2. Check Redis for Token Blacklist (Handled during Logout)
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }

        // 3. Check Redis for Global User Ban (Handled by Admin Kill Switch)
        const isBanned = await redis.get(`ban:${decoded.userId}`);
        if (isBanned) {
            return res.status(403).json({ 
                error: 'Security Alert: Your access has been revoked by an administrator.' 
            });
        }

        next(); // User is clean, proceed to the route
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please re-authenticate.' });
        }
        console.error('[SESSION ERROR]', error.message);
        res.status(401).json({ error: 'Invalid or malformed session.' });
    }
};

module.exports = { checkSession };