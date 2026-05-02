# Email & SMS Configuration Guide

## 📧 Email Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "VPN App"
4. Copy the 16-character password

### Step 3: Update .env
```env
GMAIL_USER="your_actual_email@gmail.com"
GMAIL_APP_PASSWORD="your_16_char_app_password"
```

## 📱 SMS Setup (Twilio)

### Step 1: Create Twilio Account
1. Sign up at https://www.twilio.com/try-twilio
2. Verify your email and phone

### Step 2: Get Credentials
1. Go to https://console.twilio.com/
2. Copy your "Account SID" and "Auth Token"
3. Get a phone number from https://console.twilio.com/us1/develop/phone-numbers/manage/incoming

### Step 3: Update .env
```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

## 🧪 Testing Without Configuration

If you don't configure email/SMS, the app will:
- **Email**: Print verification links to console
- **SMS**: Print OTP codes to console

Check backend logs for debug output.

## 🔄 Apply Changes

After updating .env:
```bash
cd backend
npm install twilio  # If not already installed
npx prisma migrate dev --name add_phone_fields
npm start
```

## 📝 API Endpoints

### Email Registration
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Phone Registration
```bash
POST /api/auth/register-phone
{
  "phone": "+1234567890",
  "password": "password123",
  "name": "John Doe"
}
```

### Verify Phone OTP
```bash
POST /api/auth/verify-phone
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### Resend OTP
```bash
POST /api/auth/resend-otp
{
  "phone": "+1234567890"
}
```
