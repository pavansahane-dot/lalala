-- CreateTable UserDevice
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceName" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "wgPublicKey" TEXT,
    "wgPrivateKey" TEXT,
    "assignedIP" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable VpnCredentials
CREATE TABLE "VpnCredentials" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VpnCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable BandwidthLog
CREATE TABLE "BandwidthLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "bytesUp" BIGINT NOT NULL DEFAULT 0,
    "bytesDown" BIGINT NOT NULL DEFAULT 0,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BandwidthLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BandwidthLog" ADD CONSTRAINT "BandwidthLog_deviceId_fkey"
    FOREIGN KEY ("deviceId") REFERENCES "UserDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
