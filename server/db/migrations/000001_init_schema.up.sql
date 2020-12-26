CREATE TABLE IF NOT EXISTS Users
(
    email      TEXT PRIMARY KEY,
    name       TEXT,
    password   VARCHAR(60),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Photos
(
    id          CHAR(20) PRIMARY KEY,
    username    TEXT REFERENCES Users (email) ON DELETE CASCADE,
    filename    TEXT NOT NULL,
    url         TEXT NOT NULL,
    thumbnail   TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Details
(
    id           CHAR(20) PRIMARY KEY REFERENCES Photos (id) ON DELETE CASCADE,
    file_type    TEXT  NOT NULL,
    height       INT   NOT NULL,
    width        INT   NOT NULL,
    size         FLOAT NOT NULL,
    uploaded_at  TIMESTAMP,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);