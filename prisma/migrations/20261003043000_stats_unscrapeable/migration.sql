-- A parsed page that cannot fill UnitStats is recorded here so the next run skips it.
-- HTTP and parse failures leave this null and stay eligible for retry.
ALTER TABLE "UnitMetadata" ADD COLUMN "statsUnscrapeableAt" TIMESTAMP(3);
