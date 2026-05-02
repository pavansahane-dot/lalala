const express = require('express');
const router = express.Router();
const { prisma } = require('../utils/db');
const { checkSession } = require('../middleware/session');

router.get('/', checkSession, async (req, res) => {
    try {
        const servers = await prisma.server.findMany({
            where: { isActive: true },
            select: {
                id: true,
                country: true,
                city: true,
                ip: true,
                protocol: true,
                load: true,
                isActive: true,
                cpuUsage: true,
                ramUsage: true,
                lastSeen: true,
            }
        });
        res.json(servers);
    } catch (error) {
        console.error('[SERVERS ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch live servers' });
    }
});

module.exports = router;
