-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_albumId_fkey";

-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "albumId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
