const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 */
async function sendMail(to, subject, html) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('[Mailer] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email.');
        return;
    }
    await transporter.sendMail({
        from: `"ZeroTraceVPN" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
}

function welcomeEmail(name, email, verifyUrl) {
    return sendMail(
        email,
        'Verify your ZeroTraceVPN account',
        `<p>Hi ${name || email},</p>
<p>Your ZeroTraceVPN account has been created. Click below to verify your email:</p>
<p><a href="${verifyUrl}">${verifyUrl}</a></p>
<p>This link expires in 24 hours. If you didn't sign up, ignore this email.</p>`
    );
}

function loginNotificationEmail(name, email, ip) {
    return sendMail(
        email,
        'New login to your ZeroTraceVPN account',
        `<p>Hi ${name || email},</p>
<p>A new login was detected from IP <strong>${ip}</strong>.</p>
<p>If this wasn't you, please change your password immediately.</p>`
    );
}

module.exports = { sendMail, welcomeEmail, loginNotificationEmail };
