CREATE TYPE "UnitTypePlacement" AS ENUM ('primary', 'secondary', 'excluded');

ALTER TABLE "UnitType"
  ADD COLUMN "shortName" TEXT,
  ADD COLUMN "placement" "UnitTypePlacement",
  ADD COLUMN "placementSort" INTEGER NOT NULL DEFAULT 0;

UPDATE "UnitType" SET "shortName" = 'Mech', "placement" = 'primary', "placementSort" = 0 WHERE "slug" = 'battlemech';
UPDATE "UnitType" SET "shortName" = 'Inf', "placement" = 'primary', "placementSort" = 1 WHERE "slug" = 'infantry';
UPDATE "UnitType" SET "shortName" = 'BA', "placement" = 'primary', "placementSort" = 2 WHERE "slug" = 'battle-armor';
UPDATE "UnitType" SET "shortName" = 'CV', "placement" = 'primary', "placementSort" = 3 WHERE "slug" = 'combat-vehicle';
UPDATE "UnitType" SET "shortName" = 'OV', "placement" = 'primary', "placementSort" = 4 WHERE "slug" = 'omnivehicle';

UPDATE "UnitType" SET "placement" = 'secondary', "placementSort" = 0 WHERE "slug" = 'fighter-craft';
UPDATE "UnitType" SET "placement" = 'secondary', "placementSort" = 1 WHERE "slug" = 'aerospace-craft';
UPDATE "UnitType" SET "placement" = 'secondary', "placementSort" = 2 WHERE "slug" = 'advanced-support';

UPDATE "UnitType" SET "placement" = 'excluded' WHERE "slug" IN ('buildings', 'unknown');
