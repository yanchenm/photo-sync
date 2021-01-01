ALTER TABLE auth
    DROP CONSTRAINT auth_pkey;

ALTER TABLE auth
    ADD CONSTRAINT auth_pkey PRIMARY KEY (email, token);