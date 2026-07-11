-- Moments guardados (bookmarks)
CREATE TABLE "SavedMoment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,

    CONSTRAINT "SavedMoment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedMoment_userId_momentId_key" ON "SavedMoment"("userId", "momentId");

ALTER TABLE "SavedMoment" ADD CONSTRAINT "SavedMoment_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
