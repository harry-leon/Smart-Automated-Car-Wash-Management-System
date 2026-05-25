CREATE TABLE customer_vehicles (
    id UUID PRIMARY KEY,
    owner_user_id UUID NOT NULL,
    plate VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    vehicle_year INTEGER NOT NULL,
    color VARCHAR(30),
    status VARCHAR(20) NOT NULL,
    is_primary BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_customer_vehicles_owner
        FOREIGN KEY (owner_user_id) REFERENCES auth_users (id)
);

CREATE INDEX idx_customer_vehicles_owner_status
    ON customer_vehicles (owner_user_id, status, created_at);

CREATE INDEX idx_customer_vehicles_owner_plate
    ON customer_vehicles (owner_user_id, plate);
