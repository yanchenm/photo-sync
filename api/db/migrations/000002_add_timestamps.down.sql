ALTER TABLE Users
    DROP COLUMN created_at;

ALTER TABLE Details
    DROP COLUMN uploaded_at;

ALTER TABLE Details
    DROP COLUMN processed_at;