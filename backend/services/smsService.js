const twilio = require('twilio');

let twilioClient = null;

// Initialize Twilio only if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && 
    !process.env.TWILIO_ACCOUNT_SID.includes('your_twilio')) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - E.164 format (e.g., +1234567890)
 * @param {string} otp - 6-digit OTP code
 */
async function sendOTP(phoneNumber, otp) {
    if (!twilioClient) {
        console.warn('[SMS] Twilio not configured — OTP not sent. Configure TWILIO_* env vars.');
        console.log(`[SMS] DEBUG MODE: OTP for ${phoneNumber} is: ${otp}`);
        return { success: false, message: 'SMS service not configured' };
    }

    try {
        await twilioClient.messages.create({
            body: `Your ZeroTraceVPN verification code is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        console.log(`[SMS] OTP sent to ${phoneNumber}`);
        return { success: true };
    } catch (error) {
        console.error('[SMS] Error sending OTP:', error.message);
        return { success: false, message: error.message };
    }
}

module.exports = { sendOTP };
