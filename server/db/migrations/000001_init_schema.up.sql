CREATE TABLE IF NOT EXISTS Users
(
    email    TEXT PRIMARY KEY,
    name     TEXT,
    password VARCHAR(60)
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
    id       CHAR(20) PRIMARY KEY REFERENCES Photos (id) ON DELETE CASCADE,
    FileType TEXT  NOT NULL,
    HEIGHT   INT   NOT NULL,
    WIDTH    INT   NOT NULL,
    SIZE     FLOAT NOT NULL
);