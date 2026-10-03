-- Stop the single-table scrape before applying this. It copies "Unit", retargets the
-- existing ability and availability rows, then drops "Unit".
-- Rows that were scraped but lack a slug, size, or damage band are not copied into
-- "UnitStats"; the 1.5 scraper treats a metadata row with no stats as not done.

DROP TABLE "MetadataAbility";
DROP TABLE "MetadataAvailability";

INSERT INTO "UnitMetadata" (
    "id",
    "name",
    "model",
    "typeId",
    "subType",
    "introEraId",
    "tonnage",
    "pv",
    "bv",
    "introYear",
    "removedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "name",
    "model",
    "typeId",
    "subType",
    "introEraId",
    "tonnage",
    "pv",
    "bv",
    "introYear",
    "removedAt",
    "createdAt",
    "updatedAt"
FROM "Unit";

INSERT INTO "UnitStats" (
    "unitId",
    "slug",
    "size",
    "move",
    "tmm",
    "armor",
    "structure",
    "threshold",
    "overheat",
    "dmgS",
    "dmgM",
    "dmgL",
    "dmgE",
    "specials",
    "cardVersion",
    "imageUrl",
    "sourceLastMod",
    "statsScrapedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "slug",
    "size",
    "move",
    "tmm",
    "armor",
    "structure",
    "threshold",
    "overheat",
    "dmgS",
    "dmgM",
    "dmgL",
    "dmgE",
    "specials",
    "cardVersion",
    "imageUrl",
    COALESCE("sourceLastMod", "statsScrapedAt"),
    "statsScrapedAt",
    "createdAt",
    "updatedAt"
FROM "Unit"
WHERE "statsScrapedAt" IS NOT NULL
  AND "slug" IS NOT NULL
  AND "size" IS NOT NULL
  AND "dmgS" IS NOT NULL
  AND "dmgM" IS NOT NULL
  AND "dmgL" IS NOT NULL
  AND "dmgE" IS NOT NULL;

ALTER TABLE "UnitAbility" DROP CONSTRAINT "UnitAbility_unitId_fkey";
ALTER TABLE "UnitAvailability" DROP CONSTRAINT "UnitAvailability_unitId_fkey";

ALTER TABLE "UnitAbility" ADD CONSTRAINT "UnitAbility_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnitAvailability" ADD CONSTRAINT "UnitAvailability_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "Unit";
