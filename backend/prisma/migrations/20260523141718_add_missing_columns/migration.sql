/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "freeMonthsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultProtocol" TEXT NOT NULL DEFAULT 'wireguard',
    "ovpnPort" TEXT NOT NULL DEFAULT 'udp1194',
    "wgAllowedIPs" TEXT NOT NULL DEFAULT '0.0.0.0/0',
    "wgKeepalive" INTEGER NOT NULL DEFAULT 25,
    "dnsServer" TEXT NOT NULL DEFAULT '1.1.1.1,1.0.0.1',
    "killSwitch" BOOLEAN NOT NULL DEFAULT true,
    "ipv6Leak" BOOLEAN NOT NULL DEFAULT true,
    "dnsLeakProtection" BOOLEAN NOT NULL DEFAULT true,
    "obfuscation" BOOLEAN NOT NULL DEFAULT false,
    "preferredRegion" TEXT NOT NULL DEFAULT 'auto',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notifyPasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewConfig" BOOLEAN NOT NULL DEFAULT true,
    "notifyDeviceRevoked" BOOLEAN NOT NULL DEFAULT true,
    "notifyExpiry" BOOLEAN NOT NULL DEFAULT true,
    "notifyUsageReport" BOOLEAN NOT NULL DEFAULT false,
    "notifyNewServers" BOOLEAN NOT NULL DEFAULT false,
    "notifyNewDevice" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "allowAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "analyticsCookies" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "username" TEXT,
    "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site-config',
    "siteName" TEXT NOT NULL DEFAULT 'ZeroTraceVPN',
    "tagline" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMsg" TEXT NOT NULL DEFAULT '',
    "allowedMaintenanceIPs" TEXT NOT NULL DEFAULT '',
    "announcementText" TEXT NOT NULL DEFAULT '',
    "announcementOn" BOOLEAN NOT NULL DEFAULT false,
    "announcementType" TEXT NOT NULL DEFAULT 'info',
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "requireVerify" BOOLEAN NOT NULL DEFAULT true,
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "anonDailyLimit" INTEGER NOT NULL DEFAULT 5,
    "defaultPlan" TEXT NOT NULL DEFAULT 'free',
    "autoDeleteUnverified" BOOLEAN NOT NULL DEFAULT false,
    "autoDeleteDays" INTEGER NOT NULL DEFAULT 7,
    "maxDevicesFree" INTEGER NOT NULL DEFAULT 1,
    "maxDevicesPro" INTEGER NOT NULL DEFAULT 10,
    "bannedDomains" TEXT NOT NULL DEFAULT '',
    "bannedIPs" TEXT NOT NULL DEFAULT '',
    "stripeKey" TEXT NOT NULL DEFAULT '',
    "stripeSecret" TEXT NOT NULL DEFAULT '',
    "stripeWebhook" TEXT NOT NULL DEFAULT '',
    "paypalClientId" TEXT NOT NULL DEFAULT '',
    "paypalSecret" TEXT NOT NULL DEFAULT '',
    "paypalMode" TEXT NOT NULL DEFAULT 'sandbox',
    "btcAddress" TEXT NOT NULL DEFAULT '',
    "ethAddress" TEXT NOT NULL DEFAULT '',
    "usdtTrc20" TEXT NOT NULL DEFAULT '',
    "usdtErc20" TEXT NOT NULL DEFAULT '',
    "showCrypto" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "smtpHost" TEXT NOT NULL DEFAULT '',
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpEncryption" TEXT NOT NULL DEFAULT 'tls',
    "smtpUser" TEXT NOT NULL DEFAULT '',
    "smtpPass" TEXT NOT NULL DEFAULT '',
    "smtpFromName" TEXT NOT NULL DEFAULT '',
    "smtpFromEmail" TEXT NOT NULL DEFAULT '',
    "slackWebhook" TEXT NOT NULL DEFAULT '',
    "discordWebhook" TEXT NOT NULL DEFAULT '',
    "customWebhook" TEXT NOT NULL DEFAULT '',
    "notifyNewUser" BOOLEAN NOT NULL DEFAULT true,
    "notifyPayment" BOOLEAN NOT NULL DEFAULT true,
    "notifyServerDown" BOOLEAN NOT NULL DEFAULT true,
    "notifyFailedLogins" BOOLEAN NOT NULL DEFAULT true,
    "notifyTicket" BOOLEAN NOT NULL DEFAULT false,
    "notifyAbuse" BOOLEAN NOT NULL DEFAULT false,
    "jwtExpiryHours" INTEGER NOT NULL DEFAULT 24,
    "maxLoginFails" INTEGER NOT NULL DEFAULT 5,
    "lockoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "adminAllowedIPs" TEXT NOT NULL DEFAULT '',
    "rateLimit" INTEGER NOT NULL DEFAULT 100,
    "force2FAAdmin" BOOLEAN NOT NULL DEFAULT false,
    "corsOrigins" TEXT NOT NULL DEFAULT '',
    "bcryptRounds" INTEGER NOT NULL DEFAULT 12,
    "logRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "bandwidthLogging" BOOLEAN NOT NULL DEFAULT true,
    "pingInterval" INTEGER NOT NULL DEFAULT 5,
    "serverLoadAlert" INTEGER NOT NULL DEFAULT 90,
    "alertEmail" TEXT NOT NULL DEFAULT '',
    "grafanaUrl" TEXT NOT NULL DEFAULT '',
    "gdprMode" BOOLEAN NOT NULL DEFAULT false,
    "cookieBanner" BOOLEAN NOT NULL DEFAULT true,
    "gdprEmail" TEXT NOT NULL DEFAULT '',
    "proxyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "proxyPublic" BOOLEAN NOT NULL DEFAULT false,
    "proxyRateLimit" INTEGER NOT NULL DEFAULT 100,
    "privacyPolicy" TEXT NOT NULL DEFAULT '',
    "termsOfService" TEXT NOT NULL DEFAULT '',
    "noLogsPolicy" TEXT NOT NULL DEFAULT '',
    "cookiePolicy" TEXT NOT NULL DEFAULT '',
    "warrantCanaryDate" TEXT NOT NULL DEFAULT '',
    "warrantCanaryText" TEXT NOT NULL DEFAULT '',
    "wgPort" INTEGER NOT NULL DEFAULT 51820,
    "wgDns" TEXT NOT NULL DEFAULT '1.1.1.1, 1.0.0.1',
    "wgAllowedIPs" TEXT NOT NULL DEFAULT '0.0.0.0/0',
    "wgKeepalive" INTEGER NOT NULL DEFAULT 25,
    "wgClientPool" TEXT NOT NULL DEFAULT '10.8.0.0/24',
    "wgAutoAddPeer" BOOLEAN NOT NULL DEFAULT true,
    "wgAutoRemove" BOOLEAN NOT NULL DEFAULT false,
    "wgAutoRemoveDays" INTEGER NOT NULL DEFAULT 30,
    "wgKeyRotation" BOOLEAN NOT NULL DEFAULT false,
    "wgKeyRotationDays" INTEGER NOT NULL DEFAULT 90,
    "ovpnUsername" TEXT NOT NULL DEFAULT 'vpnuser',
    "ovpnPassword" TEXT NOT NULL DEFAULT '',
    "ovpnRotation" TEXT NOT NULL DEFAULT 'manual',
    "ovpnNotifyChange" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL DEFAULT 'Unknown Device',
    "browser" TEXT NOT NULL DEFAULT 'Unknown',
    "os" TEXT NOT NULL DEFAULT 'Unknown',
    "ipAddress" TEXT NOT NULL DEFAULT 'unknown',
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
