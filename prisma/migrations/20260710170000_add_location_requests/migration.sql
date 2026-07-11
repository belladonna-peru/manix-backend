-- Solicitudes para ver ubicación (estilo inDrive)
CREATE TABLE "LocationRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "LocationRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LocationRequest_fromId_toId_key" ON "LocationRequest"("fromId", "toId");
