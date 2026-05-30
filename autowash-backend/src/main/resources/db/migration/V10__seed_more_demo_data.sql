-- V10__seed_more_demo_data.sql

-- Insert more customers (Password for all is 'Password123@', hashed using BCrypt)
INSERT INTO auth_users (id, full_name, phone, email, password_hash, role, status, tier, is_new_customer, created_at, updated_at)
VALUES
    ('11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', 'John Doe', '0901234567', 'johndoe@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'MEMBER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', 'Jane Smith', '0907654321', 'janesmith@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'SILVER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', 'Bob Wilson', '0905556666', 'bobw@email.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'PLATINUM', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert vehicles
INSERT INTO customer_vehicles (id, owner_user_id, plate, type, brand, model, vehicle_year, color, status, is_primary, created_at, updated_at)
VALUES
    ('44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '29A-11111', 'SUV', 'Honda', 'CR-V', 2021, 'White', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '51H-22222', 'CAR', 'Mazda', '3', 2022, 'Red', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '60A-33333', 'TRUCK', 'Ford', 'Ranger', 2020, 'Blue', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert bookings
INSERT INTO customer_bookings (id, customer_id, vehicle_id, package_id, booking_date, booking_time, payment_method, payment_status, status, base_price, addons_total, voucher_discount, final_amount, estimated_duration_minutes, created_at, cancelled_at, cancel_reason)
VALUES
    ('BK_1717000000003', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 2, '09:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '2 days', null, null),
    ('BK_1717000000004', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 1, '14:30:00', 'E_WALLET', 'REFUNDED', 'CANCELLED', 150000, 0, 15000, 135000, 30, CURRENT_TIMESTAMP - interval '1 days', CURRENT_TIMESTAMP, 'Changed mind'),
    ('BK_1717000000005', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE, '11:00:00', 'BANK_TRANSFER', 'PAID', 'IN_PROGRESS', 350000, 200000, 0, 550000, 75, CURRENT_TIMESTAMP, null, null),
    ('BK_1717000000006', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE + 1, '15:00:00', 'CASH_AT_COUNTER', 'PENDING', 'PENDING', 150000, 0, 0, 150000, 30, CURRENT_TIMESTAMP, null, null),
    ('BK_1717000000007', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 5, '08:00:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '5 days', null, null)
ON CONFLICT (id) DO NOTHING;

-- Insert booking addon for BK_DEMO_004
INSERT INTO booking_addons (id, booking_id, addon_id, addon_name, addon_price)
VALUES
    ('a6c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 'BK_1717000000005', 'addon_002', 'Wax Coating', 200000)
ON CONFLICT (id) DO NOTHING;

-- Insert wash sessions for COMPLETED/IN_PROGRESS
INSERT INTO wash_sessions (id, booking_id, status, created_at, queued_at, checked_in_at, started_at, completed_at)
VALUES
    ('77c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'BK_1717000000003', 'COMPLETED', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days'),
    ('88c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'BK_1717000000005', 'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null),
    ('99c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'BK_1717000000007', 'COMPLETED', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days')
ON CONFLICT (id) DO NOTHING;
