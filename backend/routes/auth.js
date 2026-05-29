const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../utils/db');
const redis = null; // Redis disabled for deployment
const { logEvent } = require('../middleware/audit');
const { welcomeEmail, loginNotificationEmail, sendMail } = require('../services/mailer');
const { sendOTP } = require('../services/smsService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:5000';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            await logEvent('SYSTEM', 'REGISTRATION_ATTEMPT_EXISTING_EMAIL', req);
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const verifyToken = crypto.randomBytes(32).toString('hex');

        const user = await prisma.user.create({
            data: { email, passwordHash, name: name || null, plan: 'free', verifyToken, emailVerified: true }
        });

        await logEvent(user.id, 'USER_REGISTERED', req);

        const verifyUrl = `${API_URL}/api/auth/verify-email?token=${verifyToken}`;
        const emailSent = await welcomeEmail(name, email, verifyUrl).catch(e => {
            console.error('[Mailer] welcome:', e.message);
            return false;
        });

        if (!emailSent && (!process.env.GMAIL_USER || process.env.GMAIL_USER.includes('your_gmail'))) {
            console.warn('[Auth] Email not configured. Verification link:', verifyUrl);
            return res.status(201).json({ 
                message: 'Account created. Email service not configured - contact admin for verification.', 
                userId: user.id,
                debug: { verifyUrl } // Remove in production
            });
        }

        res.status(201).json({ message: 'Account created. Please check your email to verify your account.', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/register-phone — Register with phone number
router.post('/register-phone', async (req, res) => {
    try {
        const { phone, password, name } = req.body;
        if (!phone || !password) return res.status(400).json({ error: 'Phone and password are required' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        // Validate phone format (basic E.164 check)
        if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone format. Use E.164 format (e.g., +1234567890)' });
        }

        const existing = await prisma.user.findFirst({ where: { phone } });
        if (existing) {
            await logEvent('SYSTEM', 'REGISTRATION_ATTEMPT_EXISTING_PHONE', req);
            return res.status(400).json({ error: 'An account with this phone number already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in Redis temporarily (disabled)
        // await redis.set(`phone:otp:${phone}`, otp, 'EX', 600);

        const user = await prisma.user.create({
            data: { 
                email: `${phone.replace('+', '')}@phone.local`, // Temporary email
                phone,
                passwordHash, 
                name: name || null, 
                plan: 'free',
                emailVerified: false,
                phoneVerified: false
            }
        });

        await logEvent(user.id, 'USER_REGISTERED_PHONE', req);

        const smsResult = await sendOTP(phone, otp);
        
        if (!smsResult.success) {
            console.warn('[Auth] SMS not configured. OTP:', otp);
            return res.status(201).json({ 
                message: 'Account created. SMS service not configured - contact admin.', 
                userId: user.id,
                debug: { otp } // Remove in production
            });
        }

        res.status(201).json({ 
            message: 'Account created. Please verify your phone with the OTP sent via SMS.', 
            userId: user.id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/verify-phone — Verify phone OTP
router.post('/verify-phone', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

        // const storedOtp = await redis.get(`phone:otp:${phone}`);
        // if (!storedOtp || storedOtp !== otp) {
        //     return res.status(400).json({ error: 'Invalid or expired OTP' });
        // }
        // Temporary: Accept any OTP for testing
        if (otp !== '123456') {
            return res.status(400).json({ error: 'Invalid OTP. Use 123456 for testing.' });
        }

        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        await prisma.user.update({ 
            where: { id: user.id }, 
            data: { phoneVerified: true, emailVerified: true } 
        });

        // await redis.del(`phone:otp:${phone}`);
        await logEvent(user.id, 'PHONE_VERIFIED', req);

        res.json({ message: 'Phone verified successfully. You can now sign in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/resend-otp — Resend phone OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone is required' });

        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user || user.phoneVerified) {
            return res.json({ message: 'If that phone exists and is unverified, a new OTP has been sent.' });
        }

        const otp = '123456'; // Fixed OTP for testing without Redis
        // await redis.set(`phone:otp:${phone}`, otp, 'EX', 600);

        const smsResult = await sendOTP(phone, otp);
        
        if (!smsResult.success) {
            console.warn('[Auth] SMS not configured. OTP:', otp);
            return res.json({ 
                message: 'SMS service not configured.', 
                debug: { otp } // Remove in production
            });
        }

        res.json({ message: 'If that phone exists and is unverified, a new OTP has been sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.emailVerified) {
            // Always respond OK — prevents enumeration
            return res.json({ message: 'If that email exists and is unverified, a new link has been sent.' });
        }

        const verifyToken = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({ where: { id: user.id }, data: { verifyToken } });

        const verifyUrl = `${API_URL}/api/auth/verify-email?token=${verifyToken}`;
        welcomeEmail(user.name, email, verifyUrl).catch(e => console.error('[Mailer] resend verify:', e.message));

        res.json({ message: 'If that email exists and is unverified, a new link has been sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Missing token' });

        const user = await prisma.user.findUnique({ where: { verifyToken: String(token) } });
        if (!user) return res.status(400).json({ error: 'Invalid or expired verification link' });

        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, verifyToken: null } });
        await logEvent(user.id, 'EMAIL_VERIFIED', req);
        res.redirect(`${APP_URL}/login?verified=1`);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            await logEvent('SYSTEM', 'LOGIN_ATTEMPT_NONEXISTENT_USER', req);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            await logEvent(user.id, 'LOGIN_FAILED_WRONG_PASSWORD', req);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Admins bypass email verification requirement
        // if (!user.emailVerified && user.role !== 'admin' && user.adminRole === 'user') {
        //     return res.status(403).json({ error: 'Please verify your email before signing in. Check your inbox.' });
        // }

        const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret', { expiresIn: '7d' });

        await logEvent(user.id, 'USER_LOGIN', req);
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        loginNotificationEmail(user.name, user.email, clientIp).catch(e => console.error('[Mailer] login notify:', e.message));

        // Track session
        const { browser, os } = (() => {
          const ua = req.headers['user-agent'] || '';
          const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Unknown';
          const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : (ua.includes('iPhone') || ua.includes('iPad')) ? 'iOS' : 'Unknown';
          return { browser, os };
        })();
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await prisma.userSession.create({
          data: { userId: user.id, tokenHash, browser, os, ipAddress: clientIp, deviceName: `${browser} on ${os}` }
        }).catch(() => {});

        res.json({
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name, plan: user.plan, role: user.role, twoFactorEnabled: user.twoFactorEnabled }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (user && user.emailVerified) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });

            const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
            sendMail(email, 'Reset your ZeroTraceVPN password',
                `<p>Hi ${user.name || email},</p>
<p>Click the link below to reset your password. This link expires in 1 hour.</p>
<p><a href="${resetUrl}">Reset Password</a></p>
<p>If you didn't request this, ignore this email.</p>`
            ).catch(e => console.error('[Mailer] reset:', e.message));
        }
        // Always respond OK — prevents email enumeration
        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        const user = await prisma.user.findUnique({ where: { resetToken: String(token) } });
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired reset link' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, resetToken: null, resetTokenExpiry: null }
        });
        await logEvent(user.id, 'PASSWORD_RESET', req);
        res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, plan: true, role: true, adminRole: true, twoFactorEnabled: true, emailVerified: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jwt.verify(token, JWT_SECRET);

        const { name, currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const data = {};
        if (name !== undefined) data.name = name;

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ error: 'Current password is required' });
            const valid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
            if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
            data.passwordHash = await bcrypt.hash(newPassword, 12);
        }

        const updated = await prisma.user.update({
            where: { id: decoded.userId },
            data,
            select: { id: true, email: true, name: true, plan: true, role: true, adminRole: true, twoFactorEnabled: true }
        });
        await logEvent(decoded.userId, 'PROFILE_UPDATED', req);
        res.json(updated);
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

        // Check blacklist (disabled without Redis)
        // const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
        // if (isBlacklisted) return res.status(401).json({ error: 'Refresh token revoked' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret');
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(401).json({ error: 'User not found' });

        const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret', { expiresIn: '7d' });

        // Blacklist old refresh token (disabled without Redis)
        // await redis.set(`blacklist:${refreshToken}`, 'rotated', 'EX', 7 * 24 * 60 * 60);

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

// DELETE /api/auth/account — permanently delete the authenticated user's account
router.delete('/account', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jwt.verify(token, JWT_SECRET);
        await prisma.user.delete({ where: { id: decoded.userId } });
        // Blacklist the access token immediately
        await redis.set(`blacklist:${token}`, 'deleted', 'EX', 900);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// POST /api/auth/2fa/verify — verify TOTP for regular users
router.post('/2fa/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jwt.verify(token, JWT_SECRET);
        const { token: totpToken } = req.body;

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user?.twoFactorSecret) return res.status(400).json({ error: '2FA not set up' });

        const speakeasy = require('speakeasy');
        const valid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: totpToken,
            window: 1
        });

        if (!valid) return res.status(400).json({ error: 'Invalid 2FA code' });
        res.json({ message: '2FA verified' });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.decode(token);
            // await redis.set(`blacklist:${token}`, 'revoked', 'EX', 900);
            if (decoded) await logEvent(decoded.userId, 'USER_LOGOUT_SUCCESS', req);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

module.exports = router;
