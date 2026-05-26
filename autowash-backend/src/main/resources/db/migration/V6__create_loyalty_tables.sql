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
