const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { prisma } = require('./utils/db');

const passport = require('passport');
require('./routes/oauth'); // registers Google strategy

// Import Routes
const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/configs');
const billingRoutes = require('./routes/billing');
const adminRoutes = require('./routes/admin');
const serverRoutes = require('./routes/servers');
const vpnRoutes = require('./routes/vpn');
const oauthRoutes = require('./routes/oauth');
const userSettingsRoutes = require('./routes/userSettings');
const adminSettingsRoutes = require('./routes/adminSettings');

// Import Services
const { startHealthMonitoring } = require('./services/healthCheck');
const { startAlertEngine } = require('./services/alertEngine');

const { networkGuard } = require('./middleware/networkGuard');

const app = express();
const httpServer = http.createServer(app);

// --- Socket.io Setup ---
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});

// Broadcast real-time server stats every 5 seconds
const broadcastStats = async () => {
    try {
        const servers = await prisma.server.findMany({ select: { id: true, city: true, cpuUsage: true, ramUsage: true, isActive: true } });
        const hasActiveServers = servers.some(s => s.isActive);
        const activePeers = hasActiveServers ? await prisma.vpnPeer.count({ where: { isActive: true } }) : 0;
        io.emit('stats:update', { servers, activePeers, timestamp: Date.now() });
    } catch (e) {
        // silently skip if DB not ready
    }
};
setInterval(broadcastStats, 5000);

module.exports.io = io;

// --- Security & Middleware ---
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Stripe webhook — raw body, no JSON parser, no auth middleware
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), require('./routes/billing').webhookHandler);

app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());
app.use('/api/', networkGuard);

// 1. General API Rate Limiter (100 req/min)
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after a minute' }
});
app.use('/api/', apiLimiter);

// 2. BRUTE-FORCE GUARD: Strict Limiter for Auth (5 attempts per 15 mins)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts. For security, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Routes ---
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/configs', configRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/vpn', vpnRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/user', userSettingsRoutes);
app.use('/api/admin/site-settings', adminSettingsRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// --- Start Services & Server ---
startHealthMonitoring();
startAlertEngine(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Network Monitor is active...`);
    console.log(`🛡️  Brute-Force Guard enabled for Auth routes.`);
    console.log(`⚡ Socket.io real-time stats broadcasting every 5s`);
});
