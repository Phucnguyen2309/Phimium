-- PostgreSQL: separate itinerary stops with an optional image per stop.
-- Apply to the existing activities schema before starting BE with the new entity.
-- No extension is required. Preserve the legacy table and copy its rows only once.
BEGIN;

-- Keep this block identical to the itinerary block in database/ai-smart-matchmaker.sql.
-- Run before starting BE with the new ItineraryStop entity.
SELECT pg_advisory_xact_lock(hashtext('phimium:itinerary-stops-v1')::bigint);
CREATE TABLE IF NOT EXISTS backend_data_migrations (
    migration_key varchar(100) PRIMARY KEY,
    applied_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS itinerary_stops (
    stop_id uuid PRIMARY KEY,
    activity_id uuid NOT NULL CONSTRAINT fk_itinerary_stop_activity
        REFERENCES activities(activity_id) ON DELETE CASCADE,
    stop_order integer NOT NULL,
    stop_title varchar(200) NOT NULL,
    stop_description varchar(1000) NOT NULL,
    offset_minutes integer NOT NULL CHECK (offset_minutes BETWEEN 0 AND 1440),
    duration_minutes integer NOT NULL CHECK (duration_minutes BETWEEN 1 AND 1440),
    image_url varchar(2048)
);
-- Hibernate reindexes a tour's stops during updates; do not make this pair unique.
CREATE INDEX IF NOT EXISTS idx_itinerary_stop_activity_order ON itinerary_stops(activity_id, stop_order);
-- The new ORM no longer deletes legacy rows. Cascade legacy snapshots when a tour is deleted.
-- Run this schema repair even when the data-copy ledger has already been applied.
DO $legacy_fk$
DECLARE
    legacy_table regclass := to_regclass('activity_itinerary_stops');
    activity_table regclass := to_regclass('activities');
    legacy_activity_attnum smallint;
    activity_attnum smallint;
    legacy_constraint record;
    constraint_definition text;
BEGIN
    IF legacy_table IS NOT NULL AND activity_table IS NOT NULL THEN
        SELECT attnum INTO legacy_activity_attnum FROM pg_attribute
            WHERE attrelid = legacy_table AND attname = 'activity_id' AND NOT attisdropped;
        SELECT attnum INTO activity_attnum FROM pg_attribute
            WHERE attrelid = activity_table AND attname = 'activity_id' AND NOT attisdropped;
        FOR legacy_constraint IN
            SELECT c.oid, c.conname FROM pg_constraint c
            WHERE c.contype = 'f'
                AND c.conrelid = legacy_table AND c.confrelid = activity_table
                AND c.conkey = ARRAY[legacy_activity_attnum]::smallint[]
                AND c.confkey = ARRAY[activity_attnum]::smallint[]
                AND c.confdeltype <> 'c'
        LOOP
            constraint_definition := pg_get_constraintdef(legacy_constraint.oid);
            IF constraint_definition ~ ' ON DELETE ' THEN
                constraint_definition := regexp_replace(constraint_definition,
                    ' ON DELETE (NO ACTION|RESTRICT|CASCADE|SET NULL|SET DEFAULT)( \([^)]*\))?',
                    ' ON DELETE CASCADE');
            ELSE
                constraint_definition := regexp_replace(constraint_definition,
                    '( (NOT )?DEFERRABLE| NOT VALID|$)', E' ON DELETE CASCADE\\1');
            END IF;
            EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', legacy_table, legacy_constraint.conname);
            EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s',
                legacy_table, legacy_constraint.conname, constraint_definition);
        END LOOP;
    END IF;
END $legacy_fk$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM backend_data_migrations WHERE migration_key = 'itinerary-stops-v1') THEN
        IF to_regclass('activity_itinerary_stops') IS NOT NULL THEN
            LOCK TABLE activity_itinerary_stops IN SHARE MODE;
            INSERT INTO itinerary_stops (
                stop_id, activity_id, stop_order, stop_title, stop_description,
                offset_minutes, duration_minutes, image_url
            )
            SELECT
                md5('itinerary:' || activity_id::text || ':' || stop_order::text)::uuid,
                activity_id, stop_order, stop_title, stop_description,
                offset_minutes, duration_minutes, NULL
            FROM activity_itinerary_stops
            ON CONFLICT (stop_id) DO NOTHING;
        END IF;
        -- Record even a fresh database with no legacy table. Reruns never restore deleted stops.
        INSERT INTO backend_data_migrations (migration_key) VALUES ('itinerary-stops-v1');
    END IF;
END $$;
-- Legacy activity_itinerary_stops is retained for audit; the new BE uses itinerary_stops only.

COMMIT;
