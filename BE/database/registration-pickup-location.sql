-- Existing registrations keep NULL because their pickup location is unknown.
-- New registration requests require a nonblank location (maximum 500 characters).
ALTER TABLE registration ADD COLUMN IF NOT EXISTS pickup_location varchar(500);
