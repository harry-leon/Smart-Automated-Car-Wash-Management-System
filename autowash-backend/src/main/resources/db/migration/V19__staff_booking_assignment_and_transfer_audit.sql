ALTER TABLE customer_bookings
    ADD COLUMN assigned_staff_id UUID;

ALTER TABLE customer_bookings
    ADD CONSTRAINT fk_customer_bookings_assigned_staff
        FOREIGN KEY (assigned_staff_id) REFERENCES auth_users (id);

CREATE INDEX idx_customer_bookings_assigned_staff_status
    ON customer_bookings (assigned_staff_id, status);

CREATE TABLE booking_staff_transfer_audits (
    id UUID PRIMARY KEY,
    booking_id VARCHAR(40) NOT NULL,
    wash_session_id UUID,
    from_staff_id UUID,
    to_staff_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_booking_staff_transfer_booking
        FOREIGN KEY (booking_id) REFERENCES customer_bookings (id),
    CONSTRAINT fk_booking_staff_transfer_session
        FOREIGN KEY (wash_session_id) REFERENCES wash_sessions (id),
    CONSTRAINT fk_booking_staff_transfer_from_staff
        FOREIGN KEY (from_staff_id) REFERENCES auth_users (id),
    CONSTRAINT fk_booking_staff_transfer_to_staff
        FOREIGN KEY (to_staff_id) REFERENCES auth_users (id),
    CONSTRAINT fk_booking_staff_transfer_actor
        FOREIGN KEY (actor_id) REFERENCES auth_users (id)
);

CREATE INDEX idx_booking_staff_transfer_created_at
    ON booking_staff_transfer_audits (created_at DESC);

CREATE INDEX idx_booking_staff_transfer_booking
    ON booking_staff_transfer_audits (booking_id);

UPDATE customer_bookings
SET assigned_staff_id = (
    SELECT id
    FROM auth_users
    WHERE role = 'STAFF'
      AND status = 'ACTIVE'
    ORDER BY full_name
    LIMIT 1
)
WHERE assigned_staff_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM auth_users
    WHERE role = 'STAFF'
      AND status = 'ACTIVE'
);

UPDATE wash_sessions
SET assigned_staff_id = (
    SELECT booking.assigned_staff_id
    FROM customer_bookings booking
    WHERE booking.id = wash_sessions.booking_id
)
WHERE assigned_staff_id IS NULL;
