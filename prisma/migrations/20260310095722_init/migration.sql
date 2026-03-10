-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_device_idx" ON "logs"("device");

-- CreateIndex
CREATE INDEX "logs_timestamp_idx" ON "logs"("timestamp");
