# Settings API Reference

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Settings API

### Base URL: `/api/user`

#### Get User Settings
```http
GET /api/user/settings
```
**Response:**
```json
{
  "id": "...",
  "userId": "...",
  "defaultProtocol": "wireguard",
  "ovpnPort": "udp1194",
  "wgKeepalive": 25,
  "dnsServer": "1.1.1.1,1.0.0.1",
  "emailNotifications": true,
  ...
}
```

#### Update Profile
```http
PUT /api/user/settings/profile
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "country": "United States",
  "timezone": "America/New_York"
}
```

#### Change Password
```http
PUT /api/user/settings/password
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

#### Update VPN Preferences
```http
PUT /api/user/settings/vpn
Content-Type: application/json

{
  "defaultProtocol": "wireguard",
  "ovpnPort": "tcp443",
  "wgKeepalive": 25,
  "wgAllowedIPs": "0.0.0.0/0",
  "dnsServer": "1.1.1.1,1.0.0.1",
  "killSwitch": true,
  "ipv6Leak": true,
  "dnsLeakProtection": true,
  "obfuscation": false,
  "preferredRegion": "auto"
}
```

#### Update Notification Preferences
```http
PUT /api/user/settings/notifications
Content-Type: application/json

{
  "emailNotifications": true,
  "notifyPasswordChange": true,
  "notifyNewConfig": true,
  "notifyDeviceRevoked": true,
  "notifyExpiry": true,
  "notifyUsageReport": false,
  "notifyNewServers": false,
  "notifyNewDevice": true,
  "notifyNewsletter": false
}
```

#### Update Privacy Preferences
```http
PUT /api/user/settings/privacy
Content-Type: application/json

{
  "allowAnalytics": true,
  "analyticsCookies": false
}
```

### Two-Factor Authentication

#### Enable 2FA (Step 1)
```http
POST /api/user/settings/2fa/enable
```
**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauthUrl": "otpauth://totp/ZeroTraceVPN..."
}
```

#### Verify 2FA (Step 2)
```http
POST /api/user/settings/2fa/verify
Content-Type: application/json

{
  "token": "123456"
}
```
**Response:**
```json
{
  "message": "2FA enabled",
  "backupCodes": ["ABC123", "DEF456", ...]
}
```

#### Disable 2FA
```http
POST /api/user/settings/2fa/disable
Content-Type: application/json

{
  "token": "123456"
}
```

### Session Management

#### Get Active Sessions
```http
GET /api/user/sessions
```
**Response:**
```json
[
  {
    "id": "...",
    "deviceName": "Chrome on Windows",
    "browser": "Chrome",
    "os": "Windows",
    "ipAddress": "192.168.1.1",
    "lastActiveAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T09:00:00Z"
  }
]
```

#### Revoke Session
```http
DELETE /api/user/sessions/:id
```

#### Revoke All Other Sessions
```http
DELETE /api/user/sessions/all
```

### Activity & Data

#### Get Activity Log
```http
GET /api/user/activity-log?type=login&limit=20
```

#### Export User Data
```http
GET /api/user/export
```
**Response:** JSON file download

#### Delete Account
```http
DELETE /api/user/account
```

---

## Admin Settings API

### Base URL: `/api/admin/site-settings`
**Requires:** Admin role

#### Get All Site Settings
```http
GET /api/admin/site-settings
```

#### Update General Settings
```http
PUT /api/admin/site-settings/general
Content-Type: application/json

{
  "siteName": "ZeroTraceVPN",
  "tagline": "Your Privacy, Our Priority",
  "contactEmail": "contact@example.com",
  "supportEmail": "support@example.com",
  "logoUrl": "https://...",
  "announcementText": "New servers added!",
  "announcementOn": true,
  "announcementType": "info",
  "maintenanceMode": false,
  "maintenanceMsg": "We'll be back soon!",
  "allowedMaintenanceIPs": "192.168.1.1,10.0.0.1"
}
```

#### Update OpenVPN Credentials
```http
PUT /api/admin/site-settings/ovpn
Content-Type: application/json

{
  "ovpnUsername": "vpnuser",
  "ovpnPassword": "securepass123",
  "ovpnRotation": "manual",
  "ovpnNotifyChange": true
}
```

#### Update WireGuard Settings
```http
PUT /api/admin/site-settings/wireguard
Content-Type: application/json

{
  "wgPort": 51820,
  "wgDns": "1.1.1.1, 1.0.0.1",
  "wgAllowedIPs": "0.0.0.0/0",
  "wgKeepalive": 25,
  "wgClientPool": "10.8.0.0/24",
  "wgAutoAddPeer": true,
  "wgAutoRemove": false,
  "wgAutoRemoveDays": 30,
  "wgKeyRotation": false,
  "wgKeyRotationDays": 90
}
```

#### Update User Settings
```http
PUT /api/admin/site-settings/users
Content-Type: application/json

{
  "registrationOpen": true,
  "requireVerify": true,
  "allowAnonymous": true,
  "anonDailyLimit": 5,
  "defaultPlan": "free",
  "autoDeleteUnverified": false,
  "autoDeleteDays": 7,
  "maxDevicesFree": 1,
  "maxDevicesPro": 10,
  "bannedDomains": "tempmail.com,guerrillamail.com",
  "bannedIPs": "1.2.3.4,5.6.7.8"
}
```

#### Update Email/SMTP Settings
```http
PUT /api/admin/site-settings/email
Content-Type: application/json

{
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpEncryption": "tls",
  "smtpUser": "noreply@example.com",
  "smtpPass": "password123",
  "smtpFromName": "ZeroTraceVPN",
  "smtpFromEmail": "noreply@example.com"
}
```

#### Test Email Configuration
```http
POST /api/admin/site-settings/email/test
```

#### Update Billing Settings
```http
PUT /api/admin/site-settings/billing
Content-Type: application/json

{
  "stripeKey": "pk_test_...",
  "stripeSecret": "sk_test_...",
  "stripeWebhook": "whsec_...",
  "paypalClientId": "...",
  "paypalSecret": "...",
  "paypalMode": "sandbox",
  "btcAddress": "bc1...",
  "ethAddress": "0x...",
  "usdtTrc20": "T...",
  "usdtErc20": "0x...",
  "showCrypto": true,
  "currency": "USD",
  "taxRate": 0,
  "trialDays": 7
}
```

#### Update Security Settings
```http
PUT /api/admin/site-settings/security
Content-Type: application/json

{
  "jwtExpiryHours": 24,
  "maxLoginFails": 5,
  "lockoutMinutes": 30,
  "adminAllowedIPs": "192.168.1.1",
  "rateLimit": 100,
  "force2FAAdmin": false,
  "corsOrigins": "https://example.com",
  "bcryptRounds": 12
}
```

#### Update Monitoring Settings
```http
PUT /api/admin/site-settings/monitoring
Content-Type: application/json

{
  "bandwidthLogging": true,
  "pingInterval": 5,
  "serverLoadAlert": 90,
  "alertEmail": "admin@example.com",
  "grafanaUrl": "https://grafana.example.com",
  "logRetentionDays": 30
}
```

#### Update Legal Pages
```http
PUT /api/admin/site-settings/legal
Content-Type: application/json

{
  "privacyPolicy": "<html>...</html>",
  "termsOfService": "<html>...</html>",
  "noLogsPolicy": "<html>...</html>",
  "cookiePolicy": "<html>...</html>",
  "warrantCanaryDate": "2024-01-15",
  "warrantCanaryText": "As of this date...",
  "gdprMode": true,
  "cookieBanner": true,
  "gdprEmail": "privacy@example.com"
}
```

#### Update Proxy Settings
```http
PUT /api/admin/site-settings/proxy
Content-Type: application/json

{
  "proxyEnabled": true,
  "proxyPublic": false,
  "proxyRateLimit": 100
}
```

#### Update Admin Notifications
```http
PUT /api/admin/site-settings/notifications
Content-Type: application/json

{
  "slackWebhook": "https://hooks.slack.com/...",
  "discordWebhook": "https://discord.com/api/webhooks/...",
  "customWebhook": "https://example.com/webhook",
  "notifyNewUser": true,
  "notifyPayment": true,
  "notifyServerDown": true,
  "notifyFailedLogins": true,
  "notifyTicket": false,
  "notifyAbuse": false
}
```

#### Test Webhook
```http
POST /api/admin/site-settings/webhook/test
Content-Type: application/json

{
  "url": "https://hooks.slack.com/...",
  "type": "slack"
}
```

### System Logs

#### Get System Logs
```http
GET /api/admin/logs?limit=100&severity=error
```

#### Clear Old Logs
```http
DELETE /api/admin/logs/clear
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- General API: 100 requests per minute
- Auth endpoints: 5 requests per 15 minutes

---

## Examples with curl

### Get User Settings
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/user/settings
```

### Update Profile
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","country":"United States"}' \
  http://localhost:5000/api/user/settings/profile
```

### Enable 2FA
```bash
# Step 1: Get QR code
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/user/settings/2fa/enable

# Step 2: Verify with code from authenticator app
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"123456"}' \
  http://localhost:5000/api/user/settings/2fa/verify
```

### Update Admin Settings
```bash
curl -X PUT \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteName":"MyVPN","maintenanceMode":false}' \
  http://localhost:5000/api/admin/site-settings/general
```

---

## WebSocket Events (if applicable)

Settings changes can trigger real-time updates via Socket.io:

```javascript
socket.on('settings:updated', (data) => {
  console.log('Settings changed:', data);
});
```

---

**Last Updated:** 2024
**API Version:** 1.0
**Base URL:** `http://localhost:5000` (development)
