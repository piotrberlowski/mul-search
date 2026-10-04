-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- AlterTable
ALTER TABLE "UnitMetadata" ADD COLUMN "roleId" INTEGER;

-- AlterTable
ALTER TABLE "List" ADD COLUMN "eraId" INTEGER,
ADD COLUMN "factionId" INTEGER;

-- AddForeignKey
ALTER TABLE "UnitMetadata" ADD CONSTRAINT "UnitMetadata_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_eraId_fkey" FOREIGN KEY ("eraId") REFERENCES "Era"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
