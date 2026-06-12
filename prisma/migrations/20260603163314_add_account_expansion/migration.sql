-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "businessPlan" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
