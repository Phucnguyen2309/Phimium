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
CREATE TABLE IF NOT EXISTS activity_itinerary_stops (
    activity_id uuid NOT NULL REFERENCES activities(activity_id),
    stop_order integer NOT NULL,
    stop_title varchar(200) NOT NULL,
    stop_description varchar(1000) NOT NULL,
    offset_minutes integer NOT NULL CHECK (offset_minutes BETWEEN 0 AND 1440),
    duration_minutes integer NOT NULL CHECK (duration_minutes BETWEEN 1 AND 1440),
    PRIMARY KEY (activity_id, stop_order)
);
ALTER TABLE buddy ADD COLUMN IF NOT EXISTS guiding_style varchar(40);
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
