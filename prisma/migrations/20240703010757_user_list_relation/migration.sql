-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_formatId_fkey";

-- DropIndex
DROP INDEX "List_name_key";

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "ownerId" TEXT,
ALTER COLUMN "formatId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "Format"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
