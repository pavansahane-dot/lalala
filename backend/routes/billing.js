const express = require('express');
const Stripe = require('stripe');
const { prisma } = require('../utils/db');
const { checkSession } = require('../middleware/session');
const { logEvent } = require('../middleware/audit');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const PLANS = {
    pro:        { name: 'ZeroTraceVPN Pro',        amount: 999,  priceId: process.env.STRIPE_PRO_PRICE_ID },
    enterprise: { name: 'ZeroTraceVPN Enterprise', amount: 2999, priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID },
};

// POST /api/billing/create-checkout-session
router.post('/create-checkout-session', checkSession, async (req, res) => {
    try {
        const { planTier } = req.body;
        const plan = PLANS[planTier];
        if (!plan) return res.status(400).json({ error: 'Invalid plan tier' });

        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Reuse or create Stripe customer
        let customerId = user.subscription?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({ email: user.email, name: user.name || undefined });
            customerId = customer.id;
        }

        const sessionParams = {
            customer: customerId,
            payment_method_types: ['card'],
            mode: plan.priceId ? 'subscription' : 'payment',
            success_url: `${process.env.APP_URL || 'http://localhost:5173'}/billing?payment=success`,
            cancel_url:  `${process.env.APP_URL || 'http://localhost:5173'}/billing?payment=cancelled`,
            metadata: { userId: user.id, planTier },
        };

        if (plan.priceId) {
            sessionParams.line_items = [{ price: plan.priceId, quantity: 1 }];
        } else {
            sessionParams.line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: plan.name },
                    unit_amount: plan.amount,
                },
                quantity: 1,
            }];
        }

        const session = await stripe.checkout.sessions.create(sessionParams);
        await logEvent(user.id, `CHECKOUT_INITIATED_${planTier.toUpperCase()}`, req);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// GET /api/billing/status  — current subscription info
router.get('/status', checkSession, async (req, res) => {
    try {
        const sub = await prisma.subscription.findUnique({
            where: { userId: req.user.userId }
        });
        if (!sub) return res.json({ plan: 'free', status: 'none', expiresAt: null });
        res.json({ plan: sub.plan, status: sub.status, expiresAt: sub.expiresAt });
    } catch {
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

// POST /api/billing/portal  — Stripe customer portal for managing subscription
router.post('/portal', checkSession, async (req, res) => {
    try {
        const sub = await prisma.subscription.findUnique({ where: { userId: req.user.userId } });
        if (!sub?.stripeCustomerId) return res.status(400).json({ error: 'No active subscription found' });

        const session = await stripe.billingPortal.sessions.create({
            customer: sub.stripeCustomerId,
            return_url: `${process.env.APP_URL || 'http://localhost:5173'}/billing`,
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Portal Error:', error);
        res.status(500).json({ error: 'Failed to open billing portal' });
    }
});

// POST /api/billing/webhook  — exported separately, mounted in server.js with raw body
const webhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return res.status(400).send('Webhook secret not configured');

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, planTier } = session.metadata || {};
            if (userId && planTier) {
                await prisma.subscription.upsert({
                    where: { userId },
                    update: {
                        plan: planTier,
                        status: 'active',
                        stripeCustomerId: session.customer,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                    create: {
                        userId,
                        plan: planTier,
                        status: 'active',
                        stripeCustomerId: session.customer,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                });
                await prisma.user.update({ where: { id: userId }, data: { plan: planTier } });
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const stripeSub = event.data.object;
            const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: stripeSub.customer } });
            if (sub) {
                await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'cancelled' } });
                await prisma.user.update({ where: { id: sub.userId }, data: { plan: 'free' } });
            }
        }
    } catch (err) {
        console.error('[Webhook] DB error:', err);
    }

    res.json({ received: true });
};

module.exports = router;
module.exports.webhookHandler = webhookHandler;
