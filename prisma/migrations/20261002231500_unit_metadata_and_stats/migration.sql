-- CreateTable
CREATE TABLE "UnitMetadata" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "typeId" INTEGER NOT NULL,
    "subType" TEXT,
    "introEraId" INTEGER,
    "tonnage" DOUBLE PRECISION,
    "pv" INTEGER,
    "bv" INTEGER,
    "introYear" INTEGER,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitStats" (
    "unitId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "move" TEXT,
    "tmm" INTEGER,
    "armor" INTEGER,
    "structure" INTEGER,
    "threshold" INTEGER,
    "overheat" INTEGER,
    "dmgS" TEXT NOT NULL,
    "dmgM" TEXT NOT NULL,
    "dmgL" TEXT NOT NULL,
    "dmgE" TEXT NOT NULL,
    "specials" TEXT,
    "cardVersion" TEXT,
    "imageUrl" TEXT,
    "sourceLastMod" TIMESTAMP(3),
    "statsScrapedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitStats_pkey" PRIMARY KEY ("unitId")
);

-- CreateIndex
CREATE INDEX "UnitMetadata_typeId_idx" ON "UnitMetadata"("typeId");

-- CreateIndex
CREATE INDEX "UnitMetadata_name_idx" ON "UnitMetadata"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UnitStats_slug_key" ON "UnitStats"("slug");

-- AddForeignKey
ALTER TABLE "UnitMetadata" ADD CONSTRAINT "UnitMetadata_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "UnitType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitMetadata" ADD CONSTRAINT "UnitMetadata_introEraId_fkey" FOREIGN KEY ("introEraId") REFERENCES "Era"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitStats" ADD CONSTRAINT "UnitStats_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
