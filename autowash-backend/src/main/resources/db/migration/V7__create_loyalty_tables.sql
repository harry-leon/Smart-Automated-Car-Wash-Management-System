CREATE TABLE loyalty_accounts (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL UNIQUE,
    current_points INTEGER NOT NULL,
    tier VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_loyalty_accounts_customer FOREIGN KEY (customer_id) REFERENCES auth_users (id)
);

CREATE TABLE point_transactions (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_point_transactions_customer FOREIGN KEY (customer_id) REFERENCES auth_users (id),
    CONSTRAINT uq_point_transactions_type_reference UNIQUE (type, reference_id)
);

CREATE INDEX idx_point_transactions_customer_created_at
    ON point_transactions (customer_id, created_at);

INSERT INTO loyalty_accounts (id, customer_id, current_points, tier, created_at, updated_at)
SELECT
    cb.customer_id,
    cb.customer_id,
    CAST(SUM(COALESCE(ws.awarded_loyalty_points, 0)) AS INTEGER),
    au.tier,
    MIN(COALESCE(ws.completed_at, ws.created_at)),
    MAX(COALESCE(ws.completed_at, ws.created_at))
FROM wash_sessions ws
JOIN customer_bookings cb ON cb.id = ws.booking_id
JOIN auth_users au ON au.id = cb.customer_id
WHERE ws.status = 'COMPLETED'
  AND ws.awarded_loyalty_points IS NOT NULL
GROUP BY cb.customer_id, au.tier;

INSERT INTO point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at)
SELECT
    completed_sessions.session_id,
    completed_sessions.customer_id,
    'EARN',
    completed_sessions.points,
    CAST(SUM(completed_sessions.points) OVER (
        PARTITION BY completed_sessions.customer_id
        ORDER BY completed_sessions.created_at, completed_sessions.session_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS INTEGER),
    'Wash completed',
    CAST(completed_sessions.session_id AS VARCHAR(100)),
    completed_sessions.created_at
FROM (
    SELECT
        ws.id AS session_id,
        cb.customer_id,
        COALESCE(ws.awarded_loyalty_points, 0) AS points,
        COALESCE(ws.completed_at, ws.created_at) AS created_at
    FROM wash_sessions ws
    JOIN customer_bookings cb ON cb.id = ws.booking_id
    WHERE ws.status = 'COMPLETED'
      AND ws.awarded_loyalty_points IS NOT NULL
) completed_sessions;
