-- V11__seed_20_past_bookings.sql

-- Insert 20 past bookings (Completed and Cancelled)
INSERT INTO customer_bookings (id, customer_id, vehicle_id, package_id, booking_date, booking_time, payment_method, payment_status, status, base_price, addons_total, voucher_discount, final_amount, estimated_duration_minutes, created_at, cancelled_at, cancel_reason)
VALUES
    -- 1. Completed
    ('BK_1716000000101', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 60, '09:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '60 days', null, null),
    -- 2. Completed
    ('BK_1716000000102', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 55, '10:30:00', 'E_WALLET', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '55 days', null, null),
    -- 3. Cancelled
    ('BK_1716000000103', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 50, '14:00:00', 'BANK_TRANSFER', 'REFUNDED', 'CANCELLED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '50 days', CURRENT_TIMESTAMP - interval '49 days', 'Bận việc đột xuất'),
    -- 4. Completed
    ('BK_1716000000104', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 45, '15:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '45 days', null, null),
    -- 5. Completed
    ('BK_1716000000105', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 40, '08:00:00', 'E_WALLET', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '40 days', null, null),
    -- 6. Cancelled
    ('BK_1716000000106', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 35, '16:00:00', 'CASH_AT_COUNTER', 'PENDING', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '35 days', CURRENT_TIMESTAMP - interval '34 days', 'Không còn nhu cầu'),
    -- 7. Completed
    ('BK_1716000000107', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 30, '09:30:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '30 days', null, null),
    -- 8. Completed
    ('BK_1716000000108', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 28, '11:00:00', 'E_WALLET', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '28 days', null, null),
    -- 9. Completed
    ('BK_1716000000109', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 25, '13:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '25 days', null, null),
    -- 10. Cancelled
    ('BK_1716000000110', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 20, '15:00:00', 'BANK_TRANSFER', 'REFUNDED', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '20 days', CURRENT_TIMESTAMP - interval '20 days', 'Thay đổi lịch trình'),
    -- 11. Completed
    ('BK_1716000000111', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 18, '10:00:00', 'E_WALLET', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '18 days', null, null),
    -- 12. Completed
    ('BK_1716000000112', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 15, '14:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '15 days', null, null),
    -- 13. Completed
    ('BK_1716000000113', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 12, '09:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '12 days', null, null),
    -- 14. Cancelled
    ('BK_1716000000114', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 10, '16:30:00', 'E_WALLET', 'PENDING', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '10 days', CURRENT_TIMESTAMP - interval '9 days', 'Xe bị hỏng'),
    -- 15. Completed
    ('BK_1716000000115', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 8, '11:30:00', 'CASH_AT_COUNTER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '8 days', null, null),
    -- 16. Completed
    ('BK_1716000000116', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 7, '13:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '7 days', null, null),
    -- 17. Completed
    ('BK_1716000000117', 'd5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d', 'f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 5, '08:30:00', 'E_WALLET', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '5 days', null, null),
    -- 18. Cancelled
    ('BK_1716000000118', '11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 4, '10:00:00', 'CASH_AT_COUNTER', 'PENDING', 'CANCELLED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '4 days', CURRENT_TIMESTAMP - interval '4 days', 'Trời mưa không muốn rửa xe'),
    -- 19. Completed
    ('BK_1716000000119', '22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_001', CURRENT_DATE - 3, '14:00:00', 'BANK_TRANSFER', 'PAID', 'COMPLETED', 150000, 0, 0, 150000, 45, CURRENT_TIMESTAMP - interval '3 days', null, null),
    -- 20. Completed
    ('BK_1716000000120', '33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e', '66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f', 'pkg_002', CURRENT_DATE - 2, '15:30:00', 'E_WALLET', 'PAID', 'COMPLETED', 350000, 0, 0, 350000, 60, CURRENT_TIMESTAMP - interval '2 days', null, null)
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding wash sessions for the COMPLETED bookings
INSERT INTO wash_sessions (id, booking_id, status, created_at, queued_at, checked_in_at, started_at, completed_at)
VALUES
    ('11111111-1111-1111-1111-000000000101', 'BK_1716000000101', 'COMPLETED', CURRENT_TIMESTAMP - interval '60 days', CURRENT_TIMESTAMP - interval '60 days', CURRENT_TIMESTAMP - interval '60 days', CURRENT_TIMESTAMP - interval '60 days', CURRENT_TIMESTAMP - interval '60 days'),
    ('11111111-1111-1111-1111-000000000102', 'BK_1716000000102', 'COMPLETED', CURRENT_TIMESTAMP - interval '55 days', CURRENT_TIMESTAMP - interval '55 days', CURRENT_TIMESTAMP - interval '55 days', CURRENT_TIMESTAMP - interval '55 days', CURRENT_TIMESTAMP - interval '55 days'),
    ('11111111-1111-1111-1111-000000000104', 'BK_1716000000104', 'COMPLETED', CURRENT_TIMESTAMP - interval '45 days', CURRENT_TIMESTAMP - interval '45 days', CURRENT_TIMESTAMP - interval '45 days', CURRENT_TIMESTAMP - interval '45 days', CURRENT_TIMESTAMP - interval '45 days'),
    ('11111111-1111-1111-1111-000000000105', 'BK_1716000000105', 'COMPLETED', CURRENT_TIMESTAMP - interval '40 days', CURRENT_TIMESTAMP - interval '40 days', CURRENT_TIMESTAMP - interval '40 days', CURRENT_TIMESTAMP - interval '40 days', CURRENT_TIMESTAMP - interval '40 days'),
    ('11111111-1111-1111-1111-000000000107', 'BK_1716000000107', 'COMPLETED', CURRENT_TIMESTAMP - interval '30 days', CURRENT_TIMESTAMP - interval '30 days', CURRENT_TIMESTAMP - interval '30 days', CURRENT_TIMESTAMP - interval '30 days', CURRENT_TIMESTAMP - interval '30 days'),
    ('11111111-1111-1111-1111-000000000108', 'BK_1716000000108', 'COMPLETED', CURRENT_TIMESTAMP - interval '28 days', CURRENT_TIMESTAMP - interval '28 days', CURRENT_TIMESTAMP - interval '28 days', CURRENT_TIMESTAMP - interval '28 days', CURRENT_TIMESTAMP - interval '28 days'),
    ('11111111-1111-1111-1111-000000000109', 'BK_1716000000109', 'COMPLETED', CURRENT_TIMESTAMP - interval '25 days', CURRENT_TIMESTAMP - interval '25 days', CURRENT_TIMESTAMP - interval '25 days', CURRENT_TIMESTAMP - interval '25 days', CURRENT_TIMESTAMP - interval '25 days'),
    ('11111111-1111-1111-1111-000000000111', 'BK_1716000000111', 'COMPLETED', CURRENT_TIMESTAMP - interval '18 days', CURRENT_TIMESTAMP - interval '18 days', CURRENT_TIMESTAMP - interval '18 days', CURRENT_TIMESTAMP - interval '18 days', CURRENT_TIMESTAMP - interval '18 days'),
    ('11111111-1111-1111-1111-000000000112', 'BK_1716000000112', 'COMPLETED', CURRENT_TIMESTAMP - interval '15 days', CURRENT_TIMESTAMP - interval '15 days', CURRENT_TIMESTAMP - interval '15 days', CURRENT_TIMESTAMP - interval '15 days', CURRENT_TIMESTAMP - interval '15 days'),
    ('11111111-1111-1111-1111-000000000113', 'BK_1716000000113', 'COMPLETED', CURRENT_TIMESTAMP - interval '12 days', CURRENT_TIMESTAMP - interval '12 days', CURRENT_TIMESTAMP - interval '12 days', CURRENT_TIMESTAMP - interval '12 days', CURRENT_TIMESTAMP - interval '12 days'),
    ('11111111-1111-1111-1111-000000000115', 'BK_1716000000115', 'COMPLETED', CURRENT_TIMESTAMP - interval '8 days', CURRENT_TIMESTAMP - interval '8 days', CURRENT_TIMESTAMP - interval '8 days', CURRENT_TIMESTAMP - interval '8 days', CURRENT_TIMESTAMP - interval '8 days'),
    ('11111111-1111-1111-1111-000000000116', 'BK_1716000000116', 'COMPLETED', CURRENT_TIMESTAMP - interval '7 days', CURRENT_TIMESTAMP - interval '7 days', CURRENT_TIMESTAMP - interval '7 days', CURRENT_TIMESTAMP - interval '7 days', CURRENT_TIMESTAMP - interval '7 days'),
    ('11111111-1111-1111-1111-000000000117', 'BK_1716000000117', 'COMPLETED', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '5 days'),
    ('11111111-1111-1111-1111-000000000119', 'BK_1716000000119', 'COMPLETED', CURRENT_TIMESTAMP - interval '3 days', CURRENT_TIMESTAMP - interval '3 days', CURRENT_TIMESTAMP - interval '3 days', CURRENT_TIMESTAMP - interval '3 days', CURRENT_TIMESTAMP - interval '3 days'),
    ('11111111-1111-1111-1111-000000000120', 'BK_1716000000120', 'COMPLETED', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '2 days')
ON CONFLICT (id) DO NOTHING;
