-- V18__seed_more_customer_home_combos.sql

INSERT INTO service_combos (
    id,
    name,
    description,
    base_price,
    duration_days,
    max_services,
    benefits_csv,
    image_url,
    is_active,
    can_upgrade,
    upgrade_price_from
)
VALUES
    ('combo_004', 'Express Shield', 'Fast exterior wash with quick protection', 280000, 1, 1, 'Quick Wash|Protective spray', 'https://example.com/combos/express-shield.jpg', TRUE, FALSE, 390000),
    ('combo_005', 'Gloss Restore', 'Deep clean with gloss finish', 420000, 7, 2, 'Premium Clean|Gloss finish', 'https://example.com/combos/gloss-restore.jpg', TRUE, FALSE, 590000),
    ('combo_006', 'Urban Refresh', 'Best for city drivers with frequent visits', 360000, 14, 2, 'Interior vacuum|Tire shine', 'https://example.com/combos/urban-refresh.jpg', TRUE, FALSE, 510000),
    ('combo_007', 'Elite Detail Duo', 'Two premium detailing sessions', 890000, 30, 2, 'VIP Detailing x2', 'https://example.com/combos/elite-detail-duo.jpg', TRUE, FALSE, 1240000),
    ('combo_008', 'Family SUV Care', 'Protection and maintenance for SUVs', 650000, 30, 2, 'SUV deep wash|Wax coating', 'https://example.com/combos/family-suv-care.jpg', TRUE, FALSE, 890000),
    ('combo_009', 'VIP Black Edition', 'High-gloss treatment for luxury vehicles', 1150000, 45, 3, 'Black exterior polish|Glass treatment|Ceramic spray', 'https://example.com/combos/vip-black-edition.jpg', TRUE, FALSE, 1590000),
    ('combo_010', 'Fleet Saver 5', 'Savings package for multi-vehicle owners', 980000, 60, 5, '5 washes|Fleet priority|Bonus inspection', 'https://example.com/combos/fleet-saver-5.jpg', TRUE, FALSE, 1320000);
