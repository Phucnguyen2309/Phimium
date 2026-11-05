-- Optional explicit PostgreSQL migration for deployments that do not run Hibernate ddl-auto=update.
-- Existing Vietnamese content is preserved. Missing translations are filled in the background after startup.
ALTER TABLE activities ADD COLUMN IF NOT EXISTS title_en VARCHAR(400);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location_name_en VARCHAR(500);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS address_en VARCHAR(1000);
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS stop_title_en VARCHAR(400);
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS stop_description_en VARCHAR(2000);
