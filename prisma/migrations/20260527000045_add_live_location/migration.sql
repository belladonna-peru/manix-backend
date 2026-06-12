-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLocationUpdate" TIMESTAMP(3),
ADD COLUMN     "liveLat" DOUBLE PRECISION,
ADD COLUMN     "liveLng" DOUBLE PRECISION,
ADD COLUMN     "locationMode" TEXT DEFAULT 'approximate',
ADD COLUMN     "zoneName" TEXT;
