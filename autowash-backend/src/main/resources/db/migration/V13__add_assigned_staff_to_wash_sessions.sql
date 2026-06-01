ALTER TABLE wash_sessions
    ADD COLUMN assigned_staff_id UUID;

ALTER TABLE wash_sessions
    ADD CONSTRAINT fk_wash_sessions_assigned_staff
        FOREIGN KEY (assigned_staff_id) REFERENCES auth_users (id);

CREATE INDEX idx_wash_sessions_assigned_staff
    ON wash_sessions (assigned_staff_id);
