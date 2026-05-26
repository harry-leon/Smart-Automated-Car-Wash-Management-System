ALTER TABLE vouchers
    ADD COLUMN target_tiers_csv VARCHAR(100);

UPDATE vouchers
SET target_tiers_csv = 'MEMBER'
WHERE code = 'WELCOME20';

UPDATE vouchers
SET target_tiers_csv = 'MEMBER,SILVER,GOLD,PLATINUM'
WHERE code = 'OLD10';

INSERT INTO vouchers (code, discount_type, discount_value, min_amount, expires_at, active, new_customer_only, target_tiers_csv)
VALUES
    ('ALL10', 'PERCENT', 10, 100000, TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00', TRUE, FALSE, 'MEMBER,SILVER,GOLD,PLATINUM'),
    ('GOLD15', 'PERCENT', 15, 200000, TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00', TRUE, FALSE, 'GOLD,PLATINUM');
