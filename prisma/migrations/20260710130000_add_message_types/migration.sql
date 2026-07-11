-- Mensajes con tipo + media (texto / imagen / ubicación)
ALTER TABLE "Message" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text';
ALTER TABLE "Message" ADD COLUMN     "mediaUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN     "duration" INTEGER;
ALTER TABLE "Message" ADD COLUMN     "lat" DOUBLE PRECISION;
ALTER TABLE "Message" ADD COLUMN     "lng" DOUBLE PRECISION;
ALTER TABLE "Message" ALTER COLUMN "content" SET DEFAULT '';
