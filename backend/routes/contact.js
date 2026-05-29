const express = require('express');
const { sendMail } = require('../services/mailer');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limit: 5 messages per hour per IP
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Too many contact requests. Please try again later.' }
});

// POST /api/contact
router.post('/', contactLimiter, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        const subjectMap = {
            general: 'General Inquiry',
            technical: 'Technical Support',
            billing: 'Billing Question',
            bug: 'Bug Report',
            feature: 'Feature Request',
            other: 'Other'
        };

        const emailSubject = `[Contact Form] ${subjectMap[subject] || 'General'} - ${name}`;
        const emailBody = `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subjectMap[subject] || subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Sent from ZeroTraceVPN Contact Form</small></p>
        `;

        // Send to support email
        const supportEmail = process.env.SUPPORT_EMAIL || process.env.GMAIL_USER || 'support@zerotracevpn.com';
        await sendMail(supportEmail, emailSubject, emailBody);

        // Send confirmation to user
        const confirmationBody = `
            <h2>Thank you for contacting ZeroTraceVPN</h2>
            <p>Hi ${name},</p>
            <p>We've received your message and will respond within 24 hours.</p>
            <p><strong>Your message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p>Best regards,<br>ZeroTraceVPN Support Team</p>
        `;
        await sendMail(email, 'We received your message - ZeroTraceVPN', confirmationBody);

        res.json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('[Contact] Error:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
});

module.exports = router;
