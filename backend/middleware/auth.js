const jwt = require('jsonwebtoken');
const { prisma } = require('../utils/db');

const authenticateToken = (req, res, next) => {
    // Get token from the Authorization header (Format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Add user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true, adminRole: true },
        });

        if (!user || (user.role !== 'admin' && user.adminRole === 'user')) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

module.exports = { authenticateToken, requireAdmin };