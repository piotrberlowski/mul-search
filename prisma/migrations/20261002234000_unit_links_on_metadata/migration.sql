-- Drop the duplicate link tables. Ability and availability belong to UnitMetadata,
-- through the existing UnitAbility and UnitAvailability tables.
-- Those tables currently reference the scrape "Unit" table, so their rows are cleared
-- before the foreign key moves. The bundle load refills them.

DROP TABLE "MetadataAbility";
DROP TABLE "MetadataAvailability";

DELETE FROM "UnitAbility";
DELETE FROM "UnitAvailability";

ALTER TABLE "UnitAbility" DROP CONSTRAINT "UnitAbility_unitId_fkey";
ALTER TABLE "UnitAvailability" DROP CONSTRAINT "UnitAvailability_unitId_fkey";

ALTER TABLE "UnitAbility" ADD CONSTRAINT "UnitAbility_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnitAvailability" ADD CONSTRAINT "UnitAvailability_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
