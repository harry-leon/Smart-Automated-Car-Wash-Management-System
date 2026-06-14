-- Add extra staff accounts for assignment, transfer, and staff-scoped queue demos.
-- Password for demo staff accounts is 'Password123@'.
INSERT INTO auth_users (id, full_name, phone, email, password_hash, role, status, tier, is_new_customer, created_at, updated_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Linh Pham Staff', '0911111111', 'staff.linh@autowash.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'STAFF', 'ACTIVE', 'MEMBER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a2222222-2222-2222-2222-222222222222', 'Minh Tran Staff', '0922222222', 'staff.minh@autowash.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'STAFF', 'ACTIVE', 'MEMBER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Existing demo bookings are balanced across the three active staff accounts.
UPDATE customer_bookings
SET assigned_staff_id = 'b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c'
WHERE id IN ('BK_1717000000001', 'BK_1717000000005');

UPDATE customer_bookings
SET assigned_staff_id = 'a1111111-1111-1111-1111-111111111111'
WHERE id IN ('BK_1717000000002', 'BK_1717000000006');

UPDATE customer_bookings
SET assigned_staff_id = 'a2222222-2222-2222-2222-222222222222'
WHERE id IN ('BK_1717000000003', 'BK_1717000000007');

UPDATE customer_bookings
SET assigned_staff_id = 'a1111111-1111-1111-1111-111111111111'
WHERE id = 'BK_1717000000004';

UPDATE wash_sessions
SET assigned_staff_id = (
    SELECT customer_bookings.assigned_staff_id
    FROM customer_bookings
    WHERE customer_bookings.id = wash_sessions.booking_id
)
WHERE booking_id IN (
    'BK_1717000000001',
    'BK_1717000000003',
    'BK_1717000000005',
    'BK_1717000000007'
);
