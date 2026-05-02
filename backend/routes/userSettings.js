const express = require('express');
const { prisma } = require('../utils/db');
const { checkSession } = require('../middleware/session');
const speakeasy = require('speakeasy');
const crypto = require('crypto');

const router = express.Router();

// GET /api/user/settings - Get all user settings
router.get('/settings', checkSession, async (req, res) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.userId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const newSettings = await prisma.userSettings.create({
        data: { userId: req.user.userId },
      });
      return res.json(newSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/user/settings/profile - Update profile
router.put('/settings/profile', checkSession, async (req, res) => {
  try {
    const { name, email, username, country, timezone } = req.body;

    // Update user table
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      // Check if email is already taken
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user.userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updateData.email = email;
      updateData.emailVerified = false; // Require re-verification
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
    });

    // Update settings table
    await prisma.userSettings.upsert({
      where: { userId: req.user.userId },
      update: { username, country, timezone },
      create: { userId: req.user.userId, username, country, timezone },
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/user/settings/password - Change password
router.put('/settings/password', checkSession, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Invalid user' });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// PUT /api/user/settings/vpn - Update VPN preferences
router.put('/settings/vpn', checkSession, async (req, res) => {
  try {
    const {
      defaultProtocol,
      ovpnPort,
      wgKeepalive,
      wgAllowedIPs,
      dnsServer,
      killSwitch,
      ipv6Leak,
      dnsLeakProtection,
      obfuscation,
      preferredRegion,
    } = req.body;

    await prisma.userSettings.upsert({
      where: { userId: req.user.userId },
      update: {
        defaultProtocol,
        ovpnPort,
        wgKeepalive,
        wgAllowedIPs,
        dnsServer,
        killSwitch,
        ipv6Leak,
        dnsLeakProtection,
        obfuscation,
        preferredRegion,
      },
      create: {
        userId: req.user.userId,
        defaultProtocol,
        ovpnPort,
        wgKeepalive,
        wgAllowedIPs,
        dnsServer,
        killSwitch,
        ipv6Leak,
        dnsLeakProtection,
        obfuscation,
        preferredRegion,
      },
    });

    res.json({ message: 'VPN preferences saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save VPN preferences' });
  }
});

// PUT /api/user/settings/notifications - Update notification preferences
router.put('/settings/notifications', checkSession, async (req, res) => {
  try {
    const {
      emailNotifications,
      notifyPasswordChange,
      notifyNewConfig,
      notifyDeviceRevoked,
      notifyExpiry,
      notifyUsageReport,
      notifyNewServers,
      notifyNewDevice,
      notifyNewsletter,
    } = req.body;

    await prisma.userSettings.upsert({
      where: { userId: req.user.userId },
      update: {
        emailNotifications,
        notifyPasswordChange,
        notifyNewConfig,
        notifyDeviceRevoked,
        notifyExpiry,
        notifyUsageReport,
        notifyNewServers,
        notifyNewDevice,
        notifyNewsletter,
      },
      create: {
        userId: req.user.userId,
        emailNotifications,
        notifyPasswordChange,
        notifyNewConfig,
        notifyDeviceRevoked,
        notifyExpiry,
        notifyUsageReport,
        notifyNewServers,
        notifyNewDevice,
        notifyNewsletter,
      },
    });

    res.json({ message: 'Notification preferences saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save notification preferences' });
  }
});

// PUT /api/user/settings/privacy - Update privacy preferences
router.put('/settings/privacy', checkSession, async (req, res) => {
  try {
    const { allowAnalytics, analyticsCookies } = req.body;

    await prisma.userSettings.upsert({
      where: { userId: req.user.userId },
      update: { allowAnalytics, analyticsCookies },
      create: { userId: req.user.userId, allowAnalytics, analyticsCookies },
    });

    res.json({ message: 'Privacy preferences saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save privacy preferences' });
  }
});

// POST /api/user/settings/2fa/enable - Start 2FA setup
router.post('/settings/2fa/enable', checkSession, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    
    const secret = speakeasy.generateSecret({
      name: `ZeroTraceVPN (${user.email})`,
      length: 32,
    });

    // Store secret temporarily (will be confirmed on verify)
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { twoFactorSecret: secret.base32 },
    });

    res.json({
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

// POST /api/user/settings/2fa/verify - Verify and enable 2FA
router.post('/settings/2fa/verify', checkSession, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { twoFactorEnabled: true },
    });

    await prisma.userSettings.upsert({
      where: { userId: req.user.userId },
      update: { backupCodes },
      create: { userId: req.user.userId, backupCodes },
    });

    res.json({ message: '2FA enabled', backupCodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

// POST /api/user/settings/2fa/disable - Disable 2FA
router.post('/settings/2fa/disable', checkSession, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    await prisma.userSettings.update({
      where: { userId: req.user.userId },
      data: { backupCodes: [] },
    });

    res.json({ message: '2FA disabled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// GET /api/user/sessions - Get active sessions
router.get('/sessions', checkSession, async (req, res) => {
  try {
    const sessions = await prisma.userSession.findMany({
      where: { userId: req.user.userId, isRevoked: false },
      orderBy: { lastActiveAt: 'desc' },
    });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// DELETE /api/user/sessions/:id - Revoke a session
router.delete('/sessions/:id', checkSession, async (req, res) => {
  try {
    await prisma.userSession.update({
      where: { id: req.params.id, userId: req.user.userId },
      data: { isRevoked: true },
    });

    res.json({ message: 'Session revoked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

// DELETE /api/user/sessions/all - Revoke all other sessions
router.delete('/sessions/all', checkSession, async (req, res) => {
  try {
    // Get current session token hash
    const token = req.headers.authorization?.split(' ')[1];
    const currentHash = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.userSession.updateMany({
      where: {
        userId: req.user.userId,
        tokenHash: { not: currentHash },
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    res.json({ message: 'All other sessions revoked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to revoke sessions' });
  }
});

// GET /api/user/activity-log - Get account activity log
router.get('/activity-log', checkSession, async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    const where = { userId: req.user.userId };
    if (type === 'login') {
      where.action = { contains: 'LOGIN' };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// GET /api/user/export - Export user data
router.get('/export', checkSession, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        settings: true,
        auditLogs: { take: 100, orderBy: { createdAt: 'desc' } },
        sessions: true,
      },
    });

    const devices = await prisma.userDevice.findMany({
      where: { userId: req.user.userId },
    });

    const exportData = {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.createdAt,
      },
      settings: user.settings,
      devices,
      activityLog: user.auditLogs,
      sessions: user.sessions,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${user.id}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// DELETE /api/user/account - Delete account (already exists in auth.js, but adding here for completeness)
router.delete('/account', checkSession, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user.userId } });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
