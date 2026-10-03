-- CreateTable
CREATE TABLE "Era" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yearStart" INTEGER,
    "displayStart" INTEGER,
    "yearEnd" INTEGER,
    "color" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Era_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yearStart" INTEGER,
    "yearEnd" INTEGER,
    "color" TEXT,
    "manufacturer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitType" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yearStart" INTEGER,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "typeId" INTEGER NOT NULL,
    "subType" TEXT,
    "introEraId" INTEGER,
    "tonnage" DOUBLE PRECISION,
    "pv" INTEGER,
    "bv" INTEGER,
    "introYear" INTEGER,
    "size" INTEGER,
    "move" TEXT,
    "tmm" INTEGER,
    "armor" INTEGER,
    "structure" INTEGER,
    "threshold" INTEGER,
    "overheat" INTEGER,
    "dmgS" TEXT,
    "dmgM" TEXT,
    "dmgL" TEXT,
    "dmgE" TEXT,
    "specials" TEXT,
    "cardVersion" TEXT,
    "imageUrl" TEXT,
    "sourceLastMod" TIMESTAMP(3),
    "statsScrapedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitAbility" (
    "unitId" TEXT NOT NULL,
    "abilityId" INTEGER NOT NULL,

    CONSTRAINT "UnitAbility_pkey" PRIMARY KEY ("unitId","abilityId")
);

-- CreateTable
CREATE TABLE "UnitAvailability" (
    "unitId" TEXT NOT NULL,
    "eraId" INTEGER NOT NULL,
    "factionId" INTEGER NOT NULL,

    CONSTRAINT "UnitAvailability_pkey" PRIMARY KEY ("unitId","eraId","factionId")
);

-- CreateTable
CREATE TABLE "LegacyUnitId" (
    "legacyId" INTEGER NOT NULL,
    "unitId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "legacyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyUnitId_pkey" PRIMARY KEY ("legacyId")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "manifestHashes" JSONB,
    "unitsUpserted" INTEGER NOT NULL DEFAULT 0,
    "availabilityRows" INTEGER NOT NULL DEFAULT 0,
    "pagesScraped" INTEGER NOT NULL DEFAULT 0,
    "pagesFailed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Era_slug_key" ON "Era"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Faction_slug_key" ON "Faction"("slug");

-- CreateIndex
CREATE INDEX "Faction_name_idx" ON "Faction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UnitType_slug_key" ON "UnitType"("slug");

-- CreateIndex
CREATE INDEX "Ability_code_idx" ON "Ability"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_slug_key" ON "Unit"("slug");

-- CreateIndex
CREATE INDEX "Unit_typeId_idx" ON "Unit"("typeId");

-- CreateIndex
CREATE INDEX "Unit_name_idx" ON "Unit"("name");

-- CreateIndex
CREATE INDEX "UnitAvailability_factionId_eraId_idx" ON "UnitAvailability"("factionId", "eraId");

-- CreateIndex
CREATE INDEX "LegacyUnitId_unitId_idx" ON "LegacyUnitId"("unitId");

-- CreateIndex
CREATE INDEX "SyncRun_status_startedAt_idx" ON "SyncRun"("status", "startedAt");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "UnitType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_introEraId_fkey" FOREIGN KEY ("introEraId") REFERENCES "Era"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAbility" ADD CONSTRAINT "UnitAbility_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAbility" ADD CONSTRAINT "UnitAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAvailability" ADD CONSTRAINT "UnitAvailability_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAvailability" ADD CONSTRAINT "UnitAvailability_eraId_fkey" FOREIGN KEY ("eraId") REFERENCES "Era"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAvailability" ADD CONSTRAINT "UnitAvailability_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyUnitId" ADD CONSTRAINT "LegacyUnitId_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
