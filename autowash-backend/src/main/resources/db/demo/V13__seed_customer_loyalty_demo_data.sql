-- V13__seed_customer_loyalty_demo_data.sql

-- Add visible loyalty balance and transaction history for the main seeded customer account:
-- customer@gmail.com / Password123@

INSERT INTO wash_sessions (id, booking_id, status, awarded_loyalty_points, created_at, queued_at, checked_in_at, started_at, completed_at)
VALUES
    ('61111111-1111-1111-1111-000000000001', 'BK_1717000000001', 'COMPLETED', 300, CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP - INTERVAL '70 days')
ON CONFLICT (booking_id) DO UPDATE
SET
    status = EXCLUDED.status,
    awarded_loyalty_points = EXCLUDED.awarded_loyalty_points,
    completed_at = EXCLUDED.completed_at;

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
VALUES
    ('61111111-1111-1111-1111-000000000100', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 1780, 'GOLD', CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP)
ON CONFLICT (customer_id) DO UPDATE
SET
    current_points = EXCLUDED.current_points,
    tier = EXCLUDED.tier,
    updated_at = EXCLUDED.updated_at;

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
VALUES
    ('61111111-1111-1111-1111-000000000101', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 300, 300, 'Wash completed', '61111111-1111-1111-1111-000000000001', CURRENT_TIMESTAMP - INTERVAL '70 days'),
    ('61111111-1111-1111-1111-000000000102', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 250, 550, 'Wash completed', '11111111-1111-1111-1111-000000000101', CURRENT_TIMESTAMP - INTERVAL '60 days'),
    ('61111111-1111-1111-1111-000000000103', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 320, 870, 'Wash completed', '11111111-1111-1111-1111-000000000105', CURRENT_TIMESTAMP - INTERVAL '40 days'),
    ('61111111-1111-1111-1111-000000000104', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 330, 1200, 'Wash completed', '11111111-1111-1111-1111-000000000109', CURRENT_TIMESTAMP - INTERVAL '25 days'),
    ('61111111-1111-1111-1111-000000000105', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 350, 1550, 'Wash completed', '11111111-1111-1111-1111-000000000113', CURRENT_TIMESTAMP - INTERVAL '12 days'),
    ('61111111-1111-1111-1111-000000000106', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'EARN', 380, 1930, 'Wash completed', '11111111-1111-1111-1111-000000000117', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('61111111-1111-1111-1111-000000000107', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'REDEEM', -150, 1780, 'Points redeemed', 'loyalty-voucher:gold-150', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT (type, reference_id) DO UPDATE
SET
    customer_id = EXCLUDED.customer_id,
    points = EXCLUDED.points,
    balance_after = EXCLUDED.balance_after,
    reason = EXCLUDED.reason,
    created_at = EXCLUDED.created_at;
