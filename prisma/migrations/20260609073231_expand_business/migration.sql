/*
  Warnings:

  - You are about to drop the column `followersCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `followingCount` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "businessPlan" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "closeTime" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "isOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mainGoal" TEXT,
ADD COLUMN     "openTime" TEXT,
ADD COLUMN     "surveyDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "totalOrders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "workDays" TEXT;

-- AlterTable

