-- V12__seed_additional_mock_data.sql

-- 1. Catalog

-- Service Packages
INSERT INTO service_packages (id, name, description, base_price, duration_minutes, category, features_csv, image_url, status, popularity)
VALUES
    ('pkg_003', 'Standard Wash', 'Standard exterior wash with basic interior clean', 200000, 45, 'BASIC', 'Exterior wash|Dry|Vacuum interior|Tire shine', 'https://example.com/packages/standard-wash.jpg', 'ACTIVE', 'HIGH'),
    ('pkg_004', 'VIP Detailing', 'Full service detailing', 800000, 120, 'PREMIUM', 'Exterior wash|Deep interior|Engine bay|Wax coating', 'https://example.com/packages/vip-detailing.jpg', 'ACTIVE', 'LOW')
ON CONFLICT DO NOTHING;

-- Service Addons
INSERT INTO service_addons (id, name, description, price, duration_minutes, category, image_url, applicable_packages_csv, status)
VALUES
    ('addon_003', 'Ozone Odor Removal', 'Remove all bad odors inside the car', 100000, 20, 'INTERIOR', 'https://example.com/addons/ozone.jpg', 'pkg_001|pkg_002|pkg_003|pkg_004', 'ACTIVE'),
    ('addon_004', 'Glass Polishing', 'Remove water spots from windows', 150000, 30, 'EXTERIOR', 'https://example.com/addons/glass.jpg', 'pkg_001|pkg_002|pkg_003|pkg_004', 'ACTIVE'),
    ('addon_005', 'Tire Pressure Check', 'Check and inflate tires', 20000, 5, 'MAINTENANCE', 'https://example.com/addons/tire.jpg', 'pkg_001|pkg_002|pkg_003|pkg_004', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Service Combos
INSERT INTO service_combos (id, name, description, base_price, duration_days, max_services, benefits_csv, image_url, is_active, can_upgrade, upgrade_price_from)
VALUES
    ('combo_002', 'Wash & Odor Removal', 'Basic wash with ozone treatment', 220000, 1, 1, 'Basic Wash|Ozone Odor Removal', 'https://example.com/combos/wash-odor.jpg', TRUE, FALSE, 0),
    ('combo_003', '3-Month Comprehensive', 'Monthly detailing for 3 months', 2000000, 90, 3, 'VIP Detailing x3', 'https://example.com/combos/3-month.jpg', TRUE, FALSE, 0)
ON CONFLICT DO NOTHING;

-- 2. Marketing

-- Vouchers
INSERT INTO vouchers (code, discount_type, discount_value, min_amount, expires_at, active, new_customer_only)
VALUES
    ('DISCOUNT50K', 'FIXED', 50000, 200000, TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00', TRUE, FALSE),
    ('SUMMER30', 'PERCENT', 30, 300000, TIMESTAMP WITH TIME ZONE '2026-08-31 23:59:59+00:00', TRUE, FALSE),
    ('MEMBER15', 'PERCENT', 15, 100000, TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- Promotions
INSERT INTO promotions (id, name, description, discount_type, discount_value, start_date, end_date, targeting_mode, applicable_tiers_csv, max_usage_per_customer, status, created_at, updated_at)
VALUES
    ('promo_summer', 'Summer Blast', 'Hot summer deals', 'PERCENT', 20, TIMESTAMP WITH TIME ZONE '2026-06-01 00:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-08-31 23:59:59+00:00', 'ALL_TIERS', NULL, 1, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('promo_vip', 'VIP Appreciation', 'Exclusive for Plat/Gold', 'FIXED', 100000, TIMESTAMP WITH TIME ZONE '2026-01-01 00:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00', 'SELECTED_TIERS', 'GOLD,PLATINUM', 3, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 3. Users & Vehicles
INSERT INTO auth_users (id, full_name, phone, email, password_hash, role, status, tier, is_new_customer, created_at, updated_at)
VALUES
    ('a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 'Hoang Le', '0911223344', 'hoang@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'MEMBER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', 'Tuan Tran', '0922334455', 'tuan@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'SILVER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', 'Mai Nguyen', '0933445566', 'mai@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'GOLD', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'Linh Pham', '0944556677', 'linh@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'PLATINUM', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', 'Duc Bui', '0955667788', 'duc@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'MEMBER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO customer_vehicles (id, owner_user_id, plate, type, brand, model, vehicle_year, color, status, is_primary, created_at, updated_at)
VALUES
    ('b1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 'a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', '29B-12345', 'CAR', 'Kia', 'Morning', 2019, 'Yellow', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', 'a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', '51C-54321', 'SUV', 'Toyota', 'Fortuner', 2020, 'Silver', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', 'a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', '60D-99887', 'CAR', 'Mercedes', 'C200', 2023, 'Black', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'a4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', '51F-77665', 'SUV', 'BMW', 'X5', 2022, 'White', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', 'a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '30G-33221', 'CAR', 'Hyundai', 'Accent', 2021, 'Red', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 4. Bookings & Wash Sessions
INSERT INTO customer_bookings (id, customer_id, vehicle_id, package_id, combo_id, voucher_code, booking_date, booking_time, payment_method, base_price, addons_total, voucher_discount, final_amount, estimated_duration_minutes, payment_status, status, created_at, cancelled_at, cancel_reason)
VALUES
    ('BK_1716000000201', 'a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 'b1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 'pkg_003', null, 'DISCOUNT50K', CURRENT_DATE - 10, '10:00:00', 'E_WALLET', 200000, 100000, 50000, 250000, 65, 'PAID', 'COMPLETED', CURRENT_TIMESTAMP - interval '10 days', null, null),
    ('BK_1716000000202', 'a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', 'b2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', null, 'combo_003', null, CURRENT_DATE - 5, '14:30:00', 'BANK_TRANSFER', 2000000, 0, 0, 2000000, 120, 'PAID', 'COMPLETED', CURRENT_TIMESTAMP - interval '5 days', null, null),
    ('BK_1716000000203', 'a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', 'b3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', 'pkg_004', null, 'SUMMER30', CURRENT_DATE - 2, '09:00:00', 'CASH_AT_COUNTER', 800000, 150000, 285000, 665000, 150, 'PAID', 'COMPLETED', CURRENT_TIMESTAMP - interval '2 days', null, null),
    ('BK_1716000000204', 'a4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'b4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'pkg_003', null, null, CURRENT_DATE + 1, '15:30:00', 'E_WALLET', 200000, 20000, 0, 220000, 50, 'PENDING', 'CONFIRMED', CURRENT_TIMESTAMP, null, null),
    ('BK_1716000000205', 'a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', 'b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', 'pkg_001', null, null, CURRENT_DATE - 1, '08:00:00', 'BANK_TRANSFER', 150000, 0, 0, 150000, 30, 'REFUNDED', 'CANCELLED', CURRENT_TIMESTAMP - interval '1 days', CURRENT_TIMESTAMP, 'Not available')
ON CONFLICT DO NOTHING;

INSERT INTO booking_addons (id, booking_id, addon_id, addon_name, addon_price)
VALUES
    ('21111111-1111-1111-1111-000000000201', 'BK_1716000000201', 'addon_003', 'Ozone Odor Removal', 100000),
    ('21111111-1111-1111-1111-000000000203', 'BK_1716000000203', 'addon_004', 'Glass Polishing', 150000),
    ('21111111-1111-1111-1111-000000000204', 'BK_1716000000204', 'addon_005', 'Tire Pressure Check', 20000)
ON CONFLICT DO NOTHING;

INSERT INTO wash_sessions (id, booking_id, status, awarded_loyalty_points, created_at, queued_at, checked_in_at, started_at, completed_at)
VALUES
    ('31111111-1111-1111-1111-000000000201', 'BK_1716000000201', 'COMPLETED', 25, CURRENT_TIMESTAMP - interval '10 days', CURRENT_TIMESTAMP - interval '10 days', CURRENT_TIMESTAMP - interval '10 days', CURRENT_TIMESTAMP - interval '10 days', CURRENT_TIMESTAMP - interval '10 days'),
    ('31111111-1111-1111-1111-000000000202', 'BK_1716000000202', 'COMPLETED', 200, CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days'),
    ('31111111-1111-1111-1111-000000000203', 'BK_1716000000203', 'COMPLETED', 66, CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days')
ON CONFLICT DO NOTHING;

-- 5. Loyalty & Points
INSERT INTO loyalty_accounts (id, customer_id, current_points, tier, created_at, updated_at)
VALUES
    ('41111111-1111-1111-1111-000000000201', 'a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 25, 'MEMBER', CURRENT_TIMESTAMP - interval '10 days', CURRENT_TIMESTAMP - interval '10 days'),
    ('41111111-1111-1111-1111-000000000202', 'a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', 200, 'SILVER', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days'),
    ('41111111-1111-1111-1111-000000000203', 'a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', 66, 'GOLD', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days')
ON CONFLICT DO NOTHING;

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
VALUES
    ('51111111-1111-1111-1111-000000000201', 'a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 'EARN', 25, 25, 'Wash completed', '31111111-1111-1111-1111-000000000201', CURRENT_TIMESTAMP - interval '10 days'),
    ('51111111-1111-1111-1111-000000000202', 'a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', 'EARN', 200, 200, 'Wash completed', '31111111-1111-1111-1111-000000000202', CURRENT_TIMESTAMP - interval '5 days'),
    ('51111111-1111-1111-1111-000000000203', 'a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', 'EARN', 66, 66, 'Wash completed', '31111111-1111-1111-1111-000000000203', CURRENT_TIMESTAMP - interval '2 days')
ON CONFLICT DO NOTHING;
