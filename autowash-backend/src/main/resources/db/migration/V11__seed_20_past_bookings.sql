-- V11__seed_20_past_bookings.sql

-- Insert 20 past bookings (Completed and Cancelled)
INSERT INTO customer_bookings (id, customer_id, vehicle_id, package_id, booking_date, booking_time, payment_method, payment_status, status, base_price, addons_total, voucher_discount, final_amount, estimated_duration_minutes, created_at, cancelled_at, cancel_reason)
VALUES
    -- 1. Completed
    ('BK_1716000000101', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 60, '09:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '60' day, null, null),
    -- 2. Completed
    ('BK_1716000000102', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 55, '10:30:00', 'E_WALLET', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '55' day, null, null),
    -- 3. Cancelled
    ('BK_1716000000103', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 50, '14:00:00', 'BANK_TRANSFER', 'REFUNDED', 'CANCELLED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '50' day, CURRENT_TIMESTAMP - interval '49' day, 'Bận việc đột xuất'),
    -- 4. Completed
    ('BK_1716000000104', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 45, '15:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '45' day, null, null),
    -- 5. Completed
    ('BK_1716000000105', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 40, '08:00:00', 'E_WALLET', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '40' day, null, null),
    -- 6. Cancelled
    ('BK_1716000000106', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 35, '16:00:00', 'CASH_AT_COUNTER', 'PENDING', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '35' day, CURRENT_TIMESTAMP - interval '34' day, 'Không còn nhu cầu'),
    -- 7. Completed
    ('BK_1716000000107', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 30, '09:30:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '30' day, null, null),
    -- 8. Completed
    ('BK_1716000000108', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 28, '11:00:00', 'E_WALLET', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '28' day, null, null),
    -- 9. Completed
    ('BK_1716000000109', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 25, '13:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '25' day, null, null),
    -- 10. Cancelled
    ('BK_1716000000110', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 20, '15:00:00', 'BANK_TRANSFER', 'REFUNDED', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '20' day, CURRENT_TIMESTAMP - interval '20' day, 'Thay đổi lịch trình'),
    -- 11. Completed
    ('BK_1716000000111', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 18, '10:00:00', 'E_WALLET', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '18' day, null, null),
    -- 12. Completed
    ('BK_1716000000112', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 15, '14:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '15' day, null, null),
    -- 13. Completed
    ('BK_1716000000113', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 12, '09:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '12' day, null, null),
    -- 14. Cancelled
    ('BK_1716000000114', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 10, '16:30:00', 'E_WALLET', 'PENDING', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '10' day, CURRENT_TIMESTAMP - interval '9' day, 'Xe bị hỏng'),
    -- 15. Completed
    ('BK_1716000000115', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 8, '11:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '8' day, null, null),
    -- 16. Completed
    ('BK_1716000000116', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 7, '13:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '7' day, null, null),
    -- 17. Completed
    ('BK_1716000000117', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 5, '08:30:00', 'E_WALLET', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '5' day, null, null),
    -- 18. Cancelled
    ('BK_1716000000118', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 4, '10:00:00', 'CASH_AT_COUNTER', 'PENDING', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '4' day, CURRENT_TIMESTAMP - interval '4' day, 'Trời mưa không muốn rửa xe'),
    -- 19. Completed
    ('BK_1716000000119', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 3, '14:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '3' day, null, null),
    -- 20. Completed
    ('BK_1716000000120', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 2, '15:30:00', 'E_WALLET', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '2' day, null, null)
;

-- Insert corresponding wash sessions for the COMPLETED bookings
INSERT INTO wash_sessions (id, booking_id, status, created_at, queued_at, checked_in_at, started_at, completed_at)
VALUES
    ('11111111-1111-1111-1111-000000000101', 'BK_1716000000101', 'COMPLETED', CURRENT_TIMESTAMP - interval '60' day, CURRENT_TIMESTAMP - interval '60' day, CURRENT_TIMESTAMP - interval '60' day, CURRENT_TIMESTAMP - interval '60' day, CURRENT_TIMESTAMP - interval '60' day),
    ('11111111-1111-1111-1111-000000000102', 'BK_1716000000102', 'COMPLETED', CURRENT_TIMESTAMP - interval '55' day, CURRENT_TIMESTAMP - interval '55' day, CURRENT_TIMESTAMP - interval '55' day, CURRENT_TIMESTAMP - interval '55' day, CURRENT_TIMESTAMP - interval '55' day),
    ('11111111-1111-1111-1111-000000000104', 'BK_1716000000104', 'COMPLETED', CURRENT_TIMESTAMP - interval '45' day, CURRENT_TIMESTAMP - interval '45' day, CURRENT_TIMESTAMP - interval '45' day, CURRENT_TIMESTAMP - interval '45' day, CURRENT_TIMESTAMP - interval '45' day),
    ('11111111-1111-1111-1111-000000000105', 'BK_1716000000105', 'COMPLETED', CURRENT_TIMESTAMP - interval '40' day, CURRENT_TIMESTAMP - interval '40' day, CURRENT_TIMESTAMP - interval '40' day, CURRENT_TIMESTAMP - interval '40' day, CURRENT_TIMESTAMP - interval '40' day),
    ('11111111-1111-1111-1111-000000000107', 'BK_1716000000107', 'COMPLETED', CURRENT_TIMESTAMP - interval '30' day, CURRENT_TIMESTAMP - interval '30' day, CURRENT_TIMESTAMP - interval '30' day, CURRENT_TIMESTAMP - interval '30' day, CURRENT_TIMESTAMP - interval '30' day),
    ('11111111-1111-1111-1111-000000000108', 'BK_1716000000108', 'COMPLETED', CURRENT_TIMESTAMP - interval '28' day, CURRENT_TIMESTAMP - interval '28' day, CURRENT_TIMESTAMP - interval '28' day, CURRENT_TIMESTAMP - interval '28' day, CURRENT_TIMESTAMP - interval '28' day),
    ('11111111-1111-1111-1111-000000000109', 'BK_1716000000109', 'COMPLETED', CURRENT_TIMESTAMP - interval '25' day, CURRENT_TIMESTAMP - interval '25' day, CURRENT_TIMESTAMP - interval '25' day, CURRENT_TIMESTAMP - interval '25' day, CURRENT_TIMESTAMP - interval '25' day),
    ('11111111-1111-1111-1111-000000000111', 'BK_1716000000111', 'COMPLETED', CURRENT_TIMESTAMP - interval '18' day, CURRENT_TIMESTAMP - interval '18' day, CURRENT_TIMESTAMP - interval '18' day, CURRENT_TIMESTAMP - interval '18' day, CURRENT_TIMESTAMP - interval '18' day),
    ('11111111-1111-1111-1111-000000000112', 'BK_1716000000112', 'COMPLETED', CURRENT_TIMESTAMP - interval '15' day, CURRENT_TIMESTAMP - interval '15' day, CURRENT_TIMESTAMP - interval '15' day, CURRENT_TIMESTAMP - interval '15' day, CURRENT_TIMESTAMP - interval '15' day),
    ('11111111-1111-1111-1111-000000000113', 'BK_1716000000113', 'COMPLETED', CURRENT_TIMESTAMP - interval '12' day, CURRENT_TIMESTAMP - interval '12' day, CURRENT_TIMESTAMP - interval '12' day, CURRENT_TIMESTAMP - interval '12' day, CURRENT_TIMESTAMP - interval '12' day),
    ('11111111-1111-1111-1111-000000000115', 'BK_1716000000115', 'COMPLETED', CURRENT_TIMESTAMP - interval '8' day, CURRENT_TIMESTAMP - interval '8' day, CURRENT_TIMESTAMP - interval '8' day, CURRENT_TIMESTAMP - interval '8' day, CURRENT_TIMESTAMP - interval '8' day),
    ('11111111-1111-1111-1111-000000000116', 'BK_1716000000116', 'COMPLETED', CURRENT_TIMESTAMP - interval '7' day, CURRENT_TIMESTAMP - interval '7' day, CURRENT_TIMESTAMP - interval '7' day, CURRENT_TIMESTAMP - interval '7' day, CURRENT_TIMESTAMP - interval '7' day),
    ('11111111-1111-1111-1111-000000000117', 'BK_1716000000117', 'COMPLETED', CURRENT_TIMESTAMP - interval '5' day, CURRENT_TIMESTAMP - interval '5' day, CURRENT_TIMESTAMP - interval '5' day, CURRENT_TIMESTAMP - interval '5' day, CURRENT_TIMESTAMP - interval '5' day),
    ('11111111-1111-1111-1111-000000000119', 'BK_1716000000119', 'COMPLETED', CURRENT_TIMESTAMP - interval '3' day, CURRENT_TIMESTAMP - interval '3' day, CURRENT_TIMESTAMP - interval '3' day, CURRENT_TIMESTAMP - interval '3' day, CURRENT_TIMESTAMP - interval '3' day),
    ('11111111-1111-1111-1111-000000000120', 'BK_1716000000120', 'COMPLETED', CURRENT_TIMESTAMP - interval '2' day, CURRENT_TIMESTAMP - interval '2' day, CURRENT_TIMESTAMP - interval '2' day, CURRENT_TIMESTAMP - interval '2' day, CURRENT_TIMESTAMP - interval '2' day)
;
