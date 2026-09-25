-- Run once against an existing PostgreSQL database with the backend stopped.
-- Back up first. This file is deliberately NOT auto-executed by Spring.
BEGIN;
LOCK TABLE users IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email IS NULL OR btrim(email) = '') THEN
        RAISE EXCEPTION 'Resolve missing emails before migration';
    END IF;
    IF EXISTS (SELECT lower(btrim(email)) FROM users GROUP BY lower(btrim(email)) HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Resolve duplicate normalized emails before migration';
    END IF;
    IF EXISTS (SELECT btrim(phone) FROM users WHERE nullif(btrim(phone), '') IS NOT NULL GROUP BY btrim(phone) HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Resolve duplicate normalized phones before migration';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'fullName') THEN
        ALTER TABLE users RENAME COLUMN "fullName" TO full_name;
    END IF;
    IF EXISTS (SELECT 1 FROM users WHERE role::text NOT IN ('0','1','2','USER','BUDDY','ADMIN')
                    OR status::text NOT IN ('0','1','ACTIVE','INACTIVE') OR role IS NULL OR status IS NULL) THEN
        RAISE EXCEPTION 'Resolve unknown/null roles and statuses before migration';
    END IF;
END $$;

-- Original enum order: USER=0, BUDDY=1, ADMIN=2; ACTIVE=0, INACTIVE=1.
-- Drop only checks concerning role/status (Hibernate may have generated ordinal checks).
DO $$
DECLARE check_row record;
BEGIN
    FOR check_row IN
        SELECT DISTINCT c.conname FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        WHERE c.conrelid = 'users'::regclass AND c.contype = 'c' AND a.attname IN ('role', 'status')
    LOOP
        EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', check_row.conname);
    END LOOP;
END $$;
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
ALTER TABLE users ALTER COLUMN role TYPE varchar(255)
    USING CASE role::text WHEN '0' THEN 'USER' WHEN '1' THEN 'BUDDY' WHEN '2' THEN 'ADMIN' ELSE role::text END;
ALTER TABLE users ALTER COLUMN status TYPE varchar(255)
    USING CASE status::text WHEN '0' THEN 'ACTIVE' WHEN '1' THEN 'INACTIVE' ELSE status::text END;
ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN ('USER','BUDDY','ADMIN'));
ALTER TABLE users ADD CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE','INACTIVE'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed boolean;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users ALTER COLUMN birthday DROP NOT NULL;
ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
UPDATE users SET email = lower(btrim(email)), phone = nullif(btrim(phone), '');
UPDATE users SET email_verified = false WHERE email_verified IS NULL;
-- Never grant email verification during migration.
UPDATE users SET profile_completed =
    (nullif(btrim(full_name), '') IS NOT NULL AND birthday < current_date AND phone IS NOT NULL)
WHERE profile_completed IS NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN profile_completed SET DEFAULT false;
ALTER TABLE users ALTER COLUMN profile_completed SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_phone ON users(phone);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_google_sub ON users(google_sub);
COMMIT;
