-- V15__seed_customer_loyalty_demo_data.sql

-- Add visible loyalty balance and transaction history for the main seeded customer account:
-- customer@gmail.com / Password123@

INSERT INTO wash_sessions (id, booking_id, status, awarded_loyalty_points, created_at, queued_at, checked_in_at, started_at, completed_at)
SELECT
    '61111111-1111-1111-1111-000000000001',
    'BK_1717000000001',
    'COMPLETED',
    300,
    CURRENT_TIMESTAMP - INTERVAL '70' DAY,
    CURRENT_TIMESTAMP - INTERVAL '70' DAY,
    CURRENT_TIMESTAMP - INTERVAL '70' DAY,
    CURRENT_TIMESTAMP - INTERVAL '70' DAY,
    CURRENT_TIMESTAMP - INTERVAL '70' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM wash_sessions WHERE booking_id = 'BK_1717000000001'
);

UPDATE wash_sessions
SET
    status = 'COMPLETED',
    awarded_loyalty_points = 300,
    completed_at = CURRENT_TIMESTAMP - INTERVAL '70' DAY
WHERE booking_id = 'BK_1717000000001';

UPDATE wash_sessions
SET awarded_loyalty_points = CASE id
    WHEN '11111111-1111-1111-1111-000000000101' THEN 250
    WHEN '11111111-1111-1111-1111-000000000105' THEN 320
    WHEN '11111111-1111-1111-1111-000000000109' THEN 330
    WHEN '11111111-1111-1111-1111-000000000113' THEN 350
    WHEN '11111111-1111-1111-1111-000000000117' THEN 380
    ELSE awarded_loyalty_points
END
WHERE id IN (
    '11111111-1111-1111-1111-000000000101',
    '11111111-1111-1111-1111-000000000105',
    '11111111-1111-1111-1111-000000000109',
    '11111111-1111-1111-1111-000000000113',
    '11111111-1111-1111-1111-000000000117'
);

INSERT INTO loyalty_accounts (id, customer_id, current_points, tier, created_at, updated_at)
SELECT
    '61111111-1111-1111-1111-000000000100',
    'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d',
    1780,
    'GOLD',
    CURRENT_TIMESTAMP - INTERVAL '70' DAY,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM loyalty_accounts WHERE customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d'
);

UPDATE loyalty_accounts
SET
    current_points = 1780,
    tier = 'GOLD',
    updated_at = CURRENT_TIMESTAMP
WHERE customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d';

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT '61111111-1111-1111-1111-000000000101', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 300, 300, 'Wash completed', '61111111-1111-1111-1111-000000000001', CURRENT_TIMESTAMP - INTERVAL '70' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM point_transactions WHERE type = 'EARN' AND reference_id = '61111111-1111-1111-1111-000000000001'
);
UPDATE point_transactions
SET customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', points = 300, balance_after = 300, reason = 'Wash completed', created_at = CURRENT_TIMESTAMP - INTERVAL '70' DAY
WHERE type = 'EARN' AND reference_id = '61111111-1111-1111-1111-000000000001';

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT '61111111-1111-1111-1111-000000000102', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 250, 550, 'Wash completed', '11111111-1111-1111-1111-000000000101', CURRENT_TIMESTAMP - INTERVAL '60' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM point_transactions WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000101'
);
UPDATE point_transactions
SET customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', points = 250, balance_after = 550, reason = 'Wash completed', created_at = CURRENT_TIMESTAMP - INTERVAL '60' DAY
WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000101';

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT '61111111-1111-1111-1111-000000000103', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 320, 870, 'Wash completed', '11111111-1111-1111-1111-000000000105', CURRENT_TIMESTAMP - INTERVAL '40' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM point_transactions WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000105'
);
UPDATE point_transactions
SET customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', points = 320, balance_after = 870, reason = 'Wash completed', created_at = CURRENT_TIMESTAMP - INTERVAL '40' DAY
WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000105';

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT '61111111-1111-1111-1111-000000000104', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 330, 1200, 'Wash completed', '11111111-1111-1111-1111-000000000109', CURRENT_TIMESTAMP - INTERVAL '25' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM point_transactions WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000109'
);
UPDATE point_transactions
SET customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', points = 330, balance_after = 1200, reason = 'Wash completed', created_at = CURRENT_TIMESTAMP - INTERVAL '25' DAY
WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000109';

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT '61111111-1111-1111-1111-000000000105', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 350, 1550, 'Wash completed', '11111111-1111-1111-1111-000000000113', CURRENT_TIMESTAMP - INTERVAL '12' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM point_transactions WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000113'
);
UPDATE point_transactions
SET customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', points = 350, balance_after = 1550, reason = 'Wash completed', created_at = CURRENT_TIMESTAMP - INTERVAL '12' DAY
WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000113';

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT '61111111-1111-1111-1111-000000000106', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 380, 1930, 'Wash completed', '11111111-1111-1111-1111-000000000117', CURRENT_TIMESTAMP - INTERVAL '5' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM point_transactions WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000117'
);
UPDATE point_transactions
SET customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', points = 380, balance_after = 1930, reason = 'Wash completed', created_at = CURRENT_TIMESTAMP - INTERVAL '5' DAY
WHERE type = 'EARN' AND reference_id = '11111111-1111-1111-1111-000000000117';

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT '61111111-1111-1111-1111-000000000107', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'REDEEM', -150, 1780, 'Points redeemed', 'loyalty-voucher:gold-150', CURRENT_TIMESTAMP - INTERVAL '1' DAY
WHERE NOT EXISTS (
    SELECT 1 FROM point_transactions WHERE type = 'REDEEM' AND reference_id = 'loyalty-voucher:gold-150'
);
UPDATE point_transactions
SET customer_id = 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', points = -150, balance_after = 1780, reason = 'Points redeemed', created_at = CURRENT_TIMESTAMP - INTERVAL '1' DAY
WHERE type = 'REDEEM' AND reference_id = 'loyalty-voucher:gold-150';
