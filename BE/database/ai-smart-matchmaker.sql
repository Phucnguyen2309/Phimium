-- PostgreSQL, additive migration for Smart Matchmaker.
-- Apply after existing authentication and registration/payment migrations.
-- Existing tours/Buddies intentionally start without tags; populate them via metadata APIs.
BEGIN;

CREATE TABLE IF NOT EXISTS activity_matching_tags (
    activity_id uuid NOT NULL REFERENCES activities(activity_id),
    tag varchar(40) NOT NULL,
    PRIMARY KEY (activity_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_activity_matching_tag ON activity_matching_tags(tag, activity_id);
-- Keep this block identical to database/itinerary-stops.sql.
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
ALTER TABLE buddy ADD COLUMN IF NOT EXISTS guiding_style varchar(40);
ALTER TABLE buddy ALTER COLUMN bio TYPE varchar(1000);
ALTER TABLE buddy ALTER COLUMN experience TYPE varchar(1000);
ALTER TABLE buddy ALTER COLUMN introduction TYPE varchar(1000);
CREATE TABLE IF NOT EXISTS buddy_interests (
    buddy_id uuid NOT NULL REFERENCES buddy(buddy_id),
    tag varchar(40) NOT NULL,
    PRIMARY KEY (buddy_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_buddy_interest ON buddy_interests(tag, buddy_id);
CREATE TABLE IF NOT EXISTS buddy_skills (
    buddy_id uuid NOT NULL REFERENCES buddy(buddy_id),
    skill varchar(100) NOT NULL,
    PRIMARY KEY (buddy_id, skill)
);
CREATE TABLE IF NOT EXISTS buddy_languages (
    buddy_id uuid NOT NULL REFERENCES buddy(buddy_id),
    language varchar(3) NOT NULL,
    PRIMARY KEY (buddy_id, language)
);
CREATE INDEX IF NOT EXISTS idx_buddy_language ON buddy_languages(language, buddy_id);

CREATE TABLE IF NOT EXISTS ai_match_results (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(user_id),
    departure_id uuid NOT NULL REFERENCES activity_departures(departure_id),
    adult_count integer NOT NULL CHECK (adult_count >= 1),
    child_count integer NOT NULL CHECK (child_count >= 0),
    coupon_code varchar(100),
    quoted_total numeric(12,2) NOT NULL CHECK (quoted_total >= 0),
    departure_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    required_language varchar(3),
    guiding_style varchar(40),
    require_all_tags boolean NOT NULL,
    criteria_json text NOT NULL,
    metadata_fingerprint varchar(64) NOT NULL,
    engine varchar(40) NOT NULL,
    model_name varchar(100),
    prompt_version varchar(40) NOT NULL,
    created_at timestamp NOT NULL,
    expires_at timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_match_owner_expiry ON ai_match_results(user_id, expires_at);
CREATE TABLE IF NOT EXISTS ai_match_buddies (
    match_result_id uuid NOT NULL REFERENCES ai_match_results(id),
    buddy_order integer NOT NULL,
    -- Snapshot IDs intentionally remain valid for audit after a Buddy profile is removed.
    buddy_id uuid NOT NULL,
    PRIMARY KEY (match_result_id, buddy_order),
    UNIQUE (match_result_id, buddy_id)
);
CREATE TABLE IF NOT EXISTS ai_match_tags (
    match_result_id uuid NOT NULL REFERENCES ai_match_results(id),
    tag varchar(40) NOT NULL,
    PRIMARY KEY (match_result_id, tag)
);
ALTER TABLE registration ADD COLUMN IF NOT EXISTS match_result_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS ux_registration_match_result ON registration(match_result_id);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_registration_match_result'
        AND conrelid = 'registration'::regclass) THEN
        ALTER TABLE registration ADD CONSTRAINT fk_registration_match_result
            FOREIGN KEY (match_result_id) REFERENCES ai_match_results(id);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_registration_buddies_buddy ON registration_buddies(buddy_id, registration_id);
CREATE INDEX IF NOT EXISTS idx_departure_matching ON activity_departures(departure_date, status, start_time);
CREATE INDEX IF NOT EXISTS idx_registration_active_hold ON registration(status, payment_expires_at, departure_id);
COMMIT;
