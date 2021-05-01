CREATE TABLE IF NOT EXISTS Users
(
    email
    TEXT
    PRIMARY
    KEY,
    name
    TEXT,
    password
    VARCHAR
(
    60
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS Photos
(
    id CHAR
(
    27
) PRIMARY KEY,
    username TEXT REFERENCES Users
(
    email
) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    key TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    filetype TEXT NOT NULL,
    height INT NOT NULL,
    width INT NOT NULL,
    size INT NOT NULL
    );

CREATE TABLE IF NOT EXISTS Auth
(
    email TEXT REFERENCES Users
(
    email
) ON DELETE CASCADE ,
    token TEXT UNIQUE,
    PRIMARY KEY
(
    email,
    token
)
    );