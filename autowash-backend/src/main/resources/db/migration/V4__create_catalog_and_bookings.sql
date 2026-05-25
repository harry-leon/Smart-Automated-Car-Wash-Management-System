CREATE TABLE service_packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    base_price BIGINT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    category VARCHAR(30) NOT NULL,
    features_csv VARCHAR(1000),
    image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    popularity VARCHAR(20) NOT NULL
);

CREATE TABLE service_addons (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price BIGINT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    category VARCHAR(30) NOT NULL,
    image_url VARCHAR(255),
    applicable_packages_csv VARCHAR(500),
    status VARCHAR(20) NOT NULL
);

CREATE TABLE service_combos (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    base_price BIGINT NOT NULL,
    duration_days INTEGER NOT NULL,
    max_services INTEGER NOT NULL,
    benefits_csv VARCHAR(1000),
    image_url VARCHAR(255),
    is_active BOOLEAN NOT NULL,
    can_upgrade BOOLEAN NOT NULL,
    upgrade_price_from BIGINT NOT NULL
);

CREATE TABLE vouchers (
    code VARCHAR(50) PRIMARY KEY,
    discount_type VARCHAR(20) NOT NULL,
    discount_value INTEGER NOT NULL,
    min_amount BIGINT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN NOT NULL,
    new_customer_only BOOLEAN NOT NULL
);

CREATE TABLE customer_bookings (
    id VARCHAR(50) PRIMARY KEY,
    customer_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    package_id VARCHAR(50),
    combo_id VARCHAR(50),
    voucher_code VARCHAR(50),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    base_price BIGINT NOT NULL,
    addons_total BIGINT NOT NULL,
    voucher_discount BIGINT NOT NULL,
    final_amount BIGINT NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refund_amount BIGINT,
    refund_status VARCHAR(30),
    cancel_reason VARCHAR(500),
    CONSTRAINT fk_customer_bookings_customer FOREIGN KEY (customer_id) REFERENCES auth_users (id),
    CONSTRAINT fk_customer_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES customer_vehicles (id),
    CONSTRAINT fk_customer_bookings_package FOREIGN KEY (package_id) REFERENCES service_packages (id),
    CONSTRAINT fk_customer_bookings_combo FOREIGN KEY (combo_id) REFERENCES service_combos (id),
    CONSTRAINT fk_customer_bookings_voucher FOREIGN KEY (voucher_code) REFERENCES vouchers (code)
);

CREATE TABLE booking_addons (
    id UUID PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    addon_id VARCHAR(50) NOT NULL,
    addon_name VARCHAR(100) NOT NULL,
    addon_price BIGINT NOT NULL,
    CONSTRAINT fk_booking_addons_booking FOREIGN KEY (booking_id) REFERENCES customer_bookings (id),
    CONSTRAINT fk_booking_addons_addon FOREIGN KEY (addon_id) REFERENCES service_addons (id)
);

CREATE INDEX idx_customer_bookings_customer_status_date
    ON customer_bookings (customer_id, status, booking_date, created_at);

INSERT INTO service_packages (id, name, description, base_price, duration_minutes, category, features_csv, image_url, status, popularity)
VALUES
    ('pkg_001', 'Basic Wash', 'Standard wash and dry', 150000, 30, 'BASIC', 'Exterior wash|Dry|Vacuum interior', 'https://example.com/packages/basic-wash.jpg', 'ACTIVE', 'HIGH'),
    ('pkg_002', 'Premium Clean', 'Comprehensive cleaning service', 350000, 60, 'PREMIUM', 'Exterior wash|Interior vacuum|Window cleaning|Dashboard polish', 'https://example.com/packages/premium-clean.jpg', 'ACTIVE', 'MEDIUM');

INSERT INTO service_addons (id, name, description, price, duration_minutes, category, image_url, applicable_packages_csv, status)
VALUES
    ('addon_001', 'Interior Deep Clean', 'Deep carpet and upholstery cleaning', 150000, 30, 'INTERIOR', 'https://example.com/addons/interior-deep-clean.jpg', 'pkg_001|pkg_002', 'ACTIVE'),
    ('addon_002', 'Wax Coating', 'Protective wax coating for exterior', 200000, 15, 'PROTECTION', 'https://example.com/addons/wax-coating.jpg', 'pkg_002', 'ACTIVE');

INSERT INTO service_combos (id, name, description, base_price, duration_days, max_services, benefits_csv, image_url, is_active, can_upgrade, upgrade_price_from)
VALUES
    ('combo_001', 'Monthly Unlimited', 'Unlimited wash services for one month', 500000, 30, 4, 'Unlimited basic wash|Priority scheduling|5% loyalty bonus', 'https://example.com/combos/monthly-unlimited.jpg', TRUE, FALSE, 0);

INSERT INTO vouchers (code, discount_type, discount_value, min_amount, expires_at, active, new_customer_only)
VALUES
    ('WELCOME20', 'PERCENT', 20, 100000, TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00', TRUE, TRUE),
    ('OLD10', 'PERCENT', 10, 100000, TIMESTAMP WITH TIME ZONE '2025-01-01 00:00:00+00:00', TRUE, FALSE);
