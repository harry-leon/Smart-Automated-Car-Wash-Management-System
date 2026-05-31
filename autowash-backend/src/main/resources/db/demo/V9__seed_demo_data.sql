-- V9__seed_demo_data.sql

-- Insert demo users (Password for all is 'Password123@', hashed using BCrypt)
INSERT INTO auth_users (id, full_name, phone, email, password_hash, role, status, tier, is_new_customer, created_at, updated_at)
VALUES
    ('c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b', 'Admin User', '0987654321', 'admin@autowash.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'ADMIN', 'ACTIVE', 'MEMBER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c', 'Staff User', '0912345678', 'staff@autowash.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'STAFF', 'ACTIVE', 'MEMBER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'Customer Nguyen', '0909111222', 'customer@gmail.com', '$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty', 'CUSTOMER', 'ACTIVE', 'GOLD', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
;

-- Insert demo vehicle for the customer
INSERT INTO customer_vehicles (id, owner_user_id, plate, type, brand, model, vehicle_year, color, status, is_primary, created_at, updated_at)
VALUES
    ('f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', '51G-12345', 'CAR', 'Toyota', 'Camry', 2023, 'Black', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
;

-- Insert customer bookings
INSERT INTO customer_bookings (id, customer_id, vehicle_id, package_id, combo_id, voucher_code, booking_date, booking_time, payment_method, base_price, addons_total, voucher_discount, final_amount, estimated_duration_minutes, payment_status, status, created_at)
VALUES
    ('BK_1717000000001', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', null, null, CURRENT_DATE, '10:00:00', 'BANK_TRANSFER', 150000, 0, 0, 150000, 45, 'PAID', 'COMPLETED', CURRENT_TIMESTAMP),
    ('BK_1717000000002', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', null, 'WELCOME20', CURRENT_DATE + interval '1' day, '14:30:00', 'E_WALLET', 250000, 50000, 25000, 275000, 90, 'PENDING', 'PENDING', CURRENT_TIMESTAMP)
;

-- Insert demo booking addon
INSERT INTO booking_addons (id, booking_id, addon_id, addon_name, addon_price)
VALUES
    ('a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28a', 'BK_1717000000001', 'addon_001', 'Interior Deep Clean', 150000)
;
