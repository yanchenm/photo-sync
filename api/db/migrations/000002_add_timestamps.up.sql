ALTER TABLE Users
    ADD created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE Details
    ADD uploaded_at TIMESTAMP;

ALTER TABLE Details
    ADD processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;