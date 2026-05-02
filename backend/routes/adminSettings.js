const express = require('express');
const { prisma } = require('../utils/db');
const { checkSession } = require('../middleware/session');

const router = express.Router();

// Role guard for admin access
const isAdmin = (req, res, next) => {
    const role = req.user?.role;
    const adminRole = req.user?.adminRole;
    if (role === 'admin' || adminRole === 'super_admin' || adminRole === 'admin') return next();
    res.status(403).json({ error: 'Access Denied: Admins Only' });
};

// All routes require admin authentication
router.use(checkSession, isAdmin);

// GET /api/admin/site-settings - Get all site settings
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'site-config' },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.siteSettings.create({
        data: { id: 'site-config' },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/site-settings/general - Update general settings
router.put('/general', async (req, res) => {
  try {
    const {
      siteName,
      tagline,
      contactEmail,
      supportEmail,
      logoUrl,
      announcementText,
      announcementOn,
      announcementType,
      maintenanceMode,
      maintenanceMsg,
      allowedMaintenanceIPs,
    } = req.body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        siteName,
        tagline,
        contactEmail,
        supportEmail,
        logoUrl,
        announcementText,
        announcementOn,
        announcementType,
        maintenanceMode,
        maintenanceMsg,
        allowedMaintenanceIPs,
      },
      create: {
        id: 'site-config',
        siteName,
        tagline,
        contactEmail,
        supportEmail,
        logoUrl,
        announcementText,
        announcementOn,
        announcementType,
        maintenanceMode,
        maintenanceMsg,
        allowedMaintenanceIPs,
      },
    });

    res.json({ message: 'General settings updated', settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// PUT /api/admin/site-settings/ovpn - Update OpenVPN credentials
router.put('/ovpn', async (req, res) => {
  try {
    const { ovpnUsername, ovpnPassword, ovpnRotation, ovpnNotifyChange } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: { ovpnUsername, ovpnPassword, ovpnRotation, ovpnNotifyChange },
      create: { id: 'site-config', ovpnUsername, ovpnPassword, ovpnRotation, ovpnNotifyChange },
    });

    res.json({ message: 'OpenVPN credentials updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update OpenVPN settings' });
  }
});

// PUT /api/admin/site-settings/wireguard - Update WireGuard defaults
router.put('/wireguard', async (req, res) => {
  try {
    const {
      wgPort,
      wgDns,
      wgAllowedIPs,
      wgKeepalive,
      wgClientPool,
      wgAutoAddPeer,
      wgAutoRemove,
      wgAutoRemoveDays,
      wgKeyRotation,
      wgKeyRotationDays,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        wgPort,
        wgDns,
        wgAllowedIPs,
        wgKeepalive,
        wgClientPool,
        wgAutoAddPeer,
        wgAutoRemove,
        wgAutoRemoveDays,
        wgKeyRotation,
        wgKeyRotationDays,
      },
      create: {
        id: 'site-config',
        wgPort,
        wgDns,
        wgAllowedIPs,
        wgKeepalive,
        wgClientPool,
        wgAutoAddPeer,
        wgAutoRemove,
        wgAutoRemoveDays,
        wgKeyRotation,
        wgKeyRotationDays,
      },
    });

    res.json({ message: 'WireGuard settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update WireGuard settings' });
  }
});

// PUT /api/admin/site-settings/users - Update user settings
router.put('/users', async (req, res) => {
  try {
    const {
      registrationOpen,
      requireVerify,
      allowAnonymous,
      anonDailyLimit,
      defaultPlan,
      autoDeleteUnverified,
      autoDeleteDays,
      maxDevicesFree,
      maxDevicesPro,
      bannedDomains,
      bannedIPs,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        registrationOpen,
        requireVerify,
        allowAnonymous,
        anonDailyLimit,
        defaultPlan,
        autoDeleteUnverified,
        autoDeleteDays,
        maxDevicesFree,
        maxDevicesPro,
        bannedDomains,
        bannedIPs,
      },
      create: {
        id: 'site-config',
        registrationOpen,
        requireVerify,
        allowAnonymous,
        anonDailyLimit,
        defaultPlan,
        autoDeleteUnverified,
        autoDeleteDays,
        maxDevicesFree,
        maxDevicesPro,
        bannedDomains,
        bannedIPs,
      },
    });

    res.json({ message: 'User settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

// PUT /api/admin/site-settings/email - Update SMTP config
router.put('/email', async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpEncryption,
      smtpUser,
      smtpPass,
      smtpFromName,
      smtpFromEmail,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        smtpHost,
        smtpPort,
        smtpEncryption,
        smtpUser,
        smtpPass,
        smtpFromName,
        smtpFromEmail,
      },
      create: {
        id: 'site-config',
        smtpHost,
        smtpPort,
        smtpEncryption,
        smtpUser,
        smtpPass,
        smtpFromName,
        smtpFromEmail,
      },
    });

    res.json({ message: 'Email settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update email settings' });
  }
});

// POST /api/admin/site-settings/email/test - Send test email
router.post('/email/test', async (req, res) => {
  try {
    const { sendMail } = require('../services/mailer');
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'site-config' } });
    
    await sendMail(
      settings.contactEmail || 'admin@example.com',
      'Test Email from ZeroTraceVPN',
      '<p>This is a test email. Your SMTP configuration is working correctly!</p>'
    );

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send test email: ' + error.message });
  }
});

// PUT /api/admin/site-settings/billing - Update payment settings
router.put('/billing', async (req, res) => {
  try {
    const {
      stripeKey,
      stripeSecret,
      stripeWebhook,
      paypalClientId,
      paypalSecret,
      paypalMode,
      btcAddress,
      ethAddress,
      usdtTrc20,
      usdtErc20,
      showCrypto,
      currency,
      taxRate,
      trialDays,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        stripeKey,
        stripeSecret,
        stripeWebhook,
        paypalClientId,
        paypalSecret,
        paypalMode,
        btcAddress,
        ethAddress,
        usdtTrc20,
        usdtErc20,
        showCrypto,
        currency,
        taxRate,
        trialDays,
      },
      create: {
        id: 'site-config',
        stripeKey,
        stripeSecret,
        stripeWebhook,
        paypalClientId,
        paypalSecret,
        paypalMode,
        btcAddress,
        ethAddress,
        usdtTrc20,
        usdtErc20,
        showCrypto,
        currency,
        taxRate,
        trialDays,
      },
    });

    res.json({ message: 'Billing settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update billing settings' });
  }
});

// PUT /api/admin/site-settings/security - Update security config
router.put('/security', async (req, res) => {
  try {
    const {
      jwtExpiryHours,
      maxLoginFails,
      lockoutMinutes,
      adminAllowedIPs,
      rateLimit,
      force2FAAdmin,
      corsOrigins,
      bcryptRounds,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        jwtExpiryHours,
        maxLoginFails,
        lockoutMinutes,
        adminAllowedIPs,
        rateLimit,
        force2FAAdmin,
        corsOrigins,
        bcryptRounds,
      },
      create: {
        id: 'site-config',
        jwtExpiryHours,
        maxLoginFails,
        lockoutMinutes,
        adminAllowedIPs,
        rateLimit,
        force2FAAdmin,
        corsOrigins,
        bcryptRounds,
      },
    });

    res.json({ message: 'Security settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// PUT /api/admin/site-settings/monitoring - Update monitoring config
router.put('/monitoring', async (req, res) => {
  try {
    const {
      bandwidthLogging,
      pingInterval,
      serverLoadAlert,
      alertEmail,
      grafanaUrl,
      logRetentionDays,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        bandwidthLogging,
        pingInterval,
        serverLoadAlert,
        alertEmail,
        grafanaUrl,
        logRetentionDays,
      },
      create: {
        id: 'site-config',
        bandwidthLogging,
        pingInterval,
        serverLoadAlert,
        alertEmail,
        grafanaUrl,
        logRetentionDays,
      },
    });

    res.json({ message: 'Monitoring settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update monitoring settings' });
  }
});

// PUT /api/admin/site-settings/legal - Update legal page content
router.put('/legal', async (req, res) => {
  try {
    const {
      privacyPolicy,
      termsOfService,
      noLogsPolicy,
      cookiePolicy,
      warrantCanaryDate,
      warrantCanaryText,
      gdprMode,
      cookieBanner,
      gdprEmail,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        privacyPolicy,
        termsOfService,
        noLogsPolicy,
        cookiePolicy,
        warrantCanaryDate,
        warrantCanaryText,
        gdprMode,
        cookieBanner,
        gdprEmail,
      },
      create: {
        id: 'site-config',
        privacyPolicy,
        termsOfService,
        noLogsPolicy,
        cookiePolicy,
        warrantCanaryDate,
        warrantCanaryText,
        gdprMode,
        cookieBanner,
        gdprEmail,
      },
    });

    res.json({ message: 'Legal settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update legal settings' });
  }
});

// PUT /api/admin/site-settings/proxy - Update proxy settings
router.put('/proxy', async (req, res) => {
  try {
    const { proxyEnabled, proxyPublic, proxyRateLimit } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: { proxyEnabled, proxyPublic, proxyRateLimit },
      create: { id: 'site-config', proxyEnabled, proxyPublic, proxyRateLimit },
    });

    res.json({ message: 'Proxy settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update proxy settings' });
  }
});

// PUT /api/admin/site-settings/notifications - Update admin alerts
router.put('/notifications', async (req, res) => {
  try {
    const {
      slackWebhook,
      discordWebhook,
      customWebhook,
      notifyNewUser,
      notifyPayment,
      notifyServerDown,
      notifyFailedLogins,
      notifyTicket,
      notifyAbuse,
    } = req.body;

    await prisma.siteSettings.upsert({
      where: { id: 'site-config' },
      update: {
        slackWebhook,
        discordWebhook,
        customWebhook,
        notifyNewUser,
        notifyPayment,
        notifyServerDown,
        notifyFailedLogins,
        notifyTicket,
        notifyAbuse,
      },
      create: {
        id: 'site-config',
        slackWebhook,
        discordWebhook,
        customWebhook,
        notifyNewUser,
        notifyPayment,
        notifyServerDown,
        notifyFailedLogins,
        notifyTicket,
        notifyAbuse,
      },
    });

    res.json({ message: 'Notification settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// POST /api/admin/site-settings/webhook/test - Test webhook URL
router.post('/webhook/test', async (req, res) => {
  try {
    const { url, type } = req.body;
    const axios = require('axios');

    const testPayload = {
      text: 'Test notification from ZeroTraceVPN Admin Panel',
      timestamp: new Date().toISOString(),
    };

    await axios.post(url, testPayload);
    res.json({ message: `${type} webhook test successful` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Webhook test failed: ' + error.message });
  }
});

// GET /api/admin/logs - Get system logs
router.get('/logs', async (req, res) => {
  try {
    const { limit = 100, severity } = req.query;
    
    const where = {};
    if (severity) where.severity = severity;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: { user: { select: { email: true, name: true } } },
    });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// DELETE /api/admin/logs/clear - Clear old logs
router.delete('/logs/clear', async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'site-config' } });
    const retentionDays = settings?.logRetentionDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    res.json({ message: `Deleted ${result.count} old log entries` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

module.exports = router;
