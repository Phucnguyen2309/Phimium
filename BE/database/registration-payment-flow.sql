-- PostgreSQL migration. Stop the backend and back up before running.
-- Do NOT rely on ddl-auto=update to convert existing booking states.
BEGIN;
LOCK TABLE registration, payment IN ACCESS EXCLUSIVE MODE;
ALTER TABLE registration ADD COLUMN IF NOT EXISTS pickup_location varchar(500);
ALTER TABLE registration ADD COLUMN IF NOT EXISTS payment_expires_at timestamp;
ALTER TABLE registration ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamp;

-- Replace Hibernate-generated status checks so new values are accepted.
DO $$
DECLARE item record;
BEGIN
    FOR item IN
        SELECT DISTINCT c.conname, c.conrelid::regclass AS relation
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        WHERE c.conrelid IN ('registration'::regclass, 'payment'::regclass)
          AND c.contype = 'c' AND a.attname = 'status'
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', item.relation, item.conname);
    END LOOP;
END $$;
ALTER TABLE registration ADD CONSTRAINT ck_registration_status CHECK
    (status IN ('PENDING_PAYMENT','WAITING_FOR_BUDDY','BUDDY_ASSIGNED','CONFIRMED',
                'IN_PROGRESS','COMPLETED','CANCELLED','PAYMENT_REVIEW'));
ALTER TABLE payment ADD CONSTRAINT ck_payment_status CHECK
    (status IN ('PENDING','PAID','FAILED','EXPIRED','REVIEW_REQUIRED'));

-- Duplicate provider transaction IDs or multiple paid receipts need manual reconciliation.
DO $$
BEGIN
    IF EXISTS (SELECT provider_transaction_id FROM payment
               WHERE provider_transaction_id IS NOT NULL GROUP BY provider_transaction_id HAVING count(*) > 1)
       OR EXISTS (SELECT registration_id FROM payment WHERE status = 'PAID'
                  GROUP BY registration_id HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Resolve duplicate paid transactions before migration';
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_provider_transaction ON payment(provider_transaction_id);

-- Only actual payment records establish paid status. Do not trust legacy CONFIRMED alone.
UPDATE registration r SET payment_confirmed_at = COALESCE(p.paid_at, p.created_at)
FROM payment p WHERE p.registration_id = r.registration_id AND p.status = 'PAID'
    AND r.status <> 'CANCELLED' AND r.payment_confirmed_at IS NULL;

UPDATE registration SET status = CASE WHEN buddy_id IS NULL THEN 'WAITING_FOR_BUDDY' ELSE 'BUDDY_ASSIGNED' END
WHERE status = 'CONFIRMED' AND payment_confirmed_at IS NOT NULL;

-- Legacy unpaid future bookings were allocated buddies too early. Release those assignments,
-- retain their already-reserved capacity/coupon, and give a bounded payment window.
UPDATE registration r SET status = 'PENDING_PAYMENT', buddy_id = NULL, buddy_assigned_at = NULL,
    group_id = NULL,
    payment_expires_at = LEAST((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + interval '15 minutes',
                              d.departure_date + d.start_time)
FROM activity_departures d
WHERE d.departure_id = r.departure_id AND r.payment_confirmed_at IS NULL
    AND r.status IN ('WAITING_FOR_BUDDY','BUDDY_ASSIGNED','CONFIRMED')
    AND NOT EXISTS (SELECT 1 FROM payment p WHERE p.registration_id = r.registration_id AND p.status = 'REVIEW_REQUIRED');

-- Keep only the newest pending payment per booking. Old receipts can still be reconciled by invoice.
WITH ranked AS (
    SELECT id, row_number() OVER (PARTITION BY registration_id ORDER BY created_at DESC, id) AS rn
    FROM payment WHERE status = 'PENDING'
)
UPDATE payment p SET status = 'EXPIRED' FROM ranked r WHERE p.id = r.id AND r.rn > 1;
UPDATE payment p SET status = 'REVIEW_REQUIRED' FROM registration r
WHERE p.registration_id = r.registration_id AND p.status = 'PAID' AND r.status = 'CANCELLED';

COMMIT;
-- Manually audit legacy IN_PROGRESS/COMPLETED rows with payment_confirmed_at IS NULL.
-- Do not invent payment confirmation for historical bookings without payment evidence.
