CREATE TABLE promotions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    discount_type VARCHAR(20) NOT NULL,
    discount_value INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    targeting_mode VARCHAR(30) NOT NULL,
    applicable_tiers_csv VARCHAR(100),
    max_usage_per_customer INTEGER,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_promotions_status_dates
    ON promotions (status, start_date, end_date);

INSERT INTO promotions (
    id,
    name,
    description,
    discount_type,
    discount_value,
    start_date,
    end_date,
    targeting_mode,
    applicable_tiers_csv,
    max_usage_per_customer,
    status,
    created_at,
    updated_at
)
VALUES
    (
        'promo_all10',
        'ALL10',
        '10% off all active members',
        'PERCENT',
        10,
        TIMESTAMP WITH TIME ZONE '2026-01-01 00:00:00+00:00',
        TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00',
        'ALL_TIERS',
        NULL,
        NULL,
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'promo_welcome20',
        'WELCOME20',
        '20% welcome promotion for member tier',
        'PERCENT',
        20,
        TIMESTAMP WITH TIME ZONE '2026-01-01 00:00:00+00:00',
        TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00',
        'SELECTED_TIERS',
        'MEMBER',
        1,
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'promo_gold15',
        'GOLD15',
        '15% off for Gold and Platinum members',
        'PERCENT',
        15,
        TIMESTAMP WITH TIME ZONE '2026-01-01 00:00:00+00:00',
        TIMESTAMP WITH TIME ZONE '2026-12-31 23:59:59+00:00',
        'SELECTED_TIERS',
        'GOLD,PLATINUM',
        NULL,
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'promo_old10',
        'OLD10',
        'Expired promotion fixture',
        'PERCENT',
        10,
        TIMESTAMP WITH TIME ZONE '2025-01-01 00:00:00+00:00',
        TIMESTAMP WITH TIME ZONE '2025-12-31 23:59:59+00:00',
        'ALL_TIERS',
        NULL,
        NULL,
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
