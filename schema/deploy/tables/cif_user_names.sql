-- Deploy cif:tables/cif_user_names to pg
-- requires: tables/cif_user

BEGIN;

ALTER TABLE cif.cif_user
RENAME first_name TO given_name;

ALTER TABLE cif.cif_user
RENAME last_name TO family_name;

COMMIT;
