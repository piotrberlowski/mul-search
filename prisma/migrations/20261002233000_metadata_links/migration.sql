-- Availability and ability links for UnitMetadata.
-- The original UnitAbility and UnitAvailability tables still reference "Unit"
-- and stay untouched for the scrape running on step1-unit-db.

-- CreateTable
CREATE TABLE "MetadataAbility" (
    "unitId" TEXT NOT NULL,
    "abilityId" INTEGER NOT NULL,

    CONSTRAINT "MetadataAbility_pkey" PRIMARY KEY ("unitId","abilityId")
);

-- CreateTable
CREATE TABLE "MetadataAvailability" (
    "unitId" TEXT NOT NULL,
    "eraId" INTEGER NOT NULL,
    "factionId" INTEGER NOT NULL,

    CONSTRAINT "MetadataAvailability_pkey" PRIMARY KEY ("unitId","eraId","factionId")
);

-- CreateIndex
CREATE INDEX "MetadataAvailability_factionId_eraId_idx" ON "MetadataAvailability"("factionId", "eraId");

-- AddForeignKey
ALTER TABLE "MetadataAbility" ADD CONSTRAINT "MetadataAbility_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataAbility" ADD CONSTRAINT "MetadataAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataAvailability" ADD CONSTRAINT "MetadataAvailability_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataAvailability" ADD CONSTRAINT "MetadataAvailability_eraId_fkey" FOREIGN KEY ("eraId") REFERENCES "Era"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataAvailability" ADD CONSTRAINT "MetadataAvailability_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LegacyUnitId follows metadata. Safe while that table is empty; the constraint
-- is added only after the old Unit foreign key is removed.
ALTER TABLE "LegacyUnitId" DROP CONSTRAINT "LegacyUnitId_unitId_fkey";

ALTER TABLE "LegacyUnitId" ADD CONSTRAINT "LegacyUnitId_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
