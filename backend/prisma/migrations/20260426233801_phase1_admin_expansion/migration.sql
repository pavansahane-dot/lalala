-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "metadata" TEXT,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'info';

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "bytesIn" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "bytesOut" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "cpuUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ramUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sshPort" INTEGER NOT NULL DEFAULT 22,
ADD COLUMN     "sshUser" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminRole" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "bandwidthLimitMb" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- AlterTable
ALTER TABLE "VpnPeer" ADD COLUMN     "allowedIps" TEXT NOT NULL DEFAULT '0.0.0.0/0',
ADD COLUMN     "bytesRx" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "bytesTx" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "endpoint" TEXT,
ADD COLUMN     "lastHandshake" TIMESTAMP(3),
ADD COLUMN     "presharedKey" TEXT;

-- CreateTable
CREATE TABLE "OpenVpnCert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certName" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenVpnCert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "threshold" INTEGER,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastFiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenVpnCert_certName_key" ON "OpenVpnCert"("certName");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "OpenVpnCert" ADD CONSTRAINT "OpenVpnCert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
