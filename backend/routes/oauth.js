const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { prisma, redis } = require('../utils/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ── Twilio: only init if real credentials ─────────────────────────────────────
const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN  || '';
const twilioClient = TWILIO_SID.startsWith('AC') && TWILIO_TOKEN.length > 10
  ? require('twilio')(TWILIO_SID, TWILIO_TOKEN)
  : null;

// ── Google: only register strategy if real credentials ───────────────────────
const GOOGLE_ID     = process.env.GOOGLE_CLIENT_ID     || '';
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const googleEnabled = GOOGLE_ID.length > 10 && !GOOGLE_ID.startsWith('your_');

if (googleEnabled) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  passport.use(new GoogleStrategy({
    clientID:    GOOGLE_ID,
    clientSecret: GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/oauth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name  = profile.displayName;

      let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

      if (!user && email) {
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id, emailVerified: true },
          });
        }
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            email:         email || `google_${profile.id}@noemail.com`,
            name,
            googleId:      profile.id,
            emailVerified: true,
            plan:          'free',
          },
        });
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  });
}

// ── Google OAuth routes ───────────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!googleEnabled) return res.status(503).json({ error: 'Google OAuth not configured' });
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!googleEnabled) return res.status(503).json({ error: 'Google OAuth not configured' });
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${APP_URL}/login?error=google_failed`,
  })(req, res, (err) => {
    if (err) return next(err);
    const user = req.user;
    const accessToken  = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret', { expiresIn: '7d' });
    res.redirect(
      `${APP_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}` +
      `&name=${encodeURIComponent(user.name || '')}&email=${encodeURIComponent(user.email)}` +
      `&plan=${user.plan}&role=${user.role}&id=${user.id}`
    );
  });
});

// ── Phone OTP routes ──────────────────────────────────────────────────────────
router.post('/phone/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    if (!twilioClient) return res.status(503).json({ error: 'Phone auth not configured' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${phone}`, otp, 'EX', 300);

    await twilioClient.messages.create({
      body: `Your ZeroTraceVPN code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   phone,
    });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('[Phone OTP]', err.message);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

router.post('/phone/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

    const stored = await redis.get(`otp:${phone}`);
    if (!stored || stored !== otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    await redis.del(`otp:${phone}`);

    let user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: `phone_${phone.replace(/\D/g, '')}@noemail.com`, phoneNumber: phone, phoneVerified: true, plan: 'free' },
      });
    } else if (!user.phoneVerified) {
      user = await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    }

    const accessToken  = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret', { expiresIn: '7d' });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, role: user.role },
    });
  } catch (err) {
    console.error('[Phone Verify]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
