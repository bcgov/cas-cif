-- Revert cif:tables/cif_user_names from pg

BEGIN;

ALTER TABLE cif.cif_user
RENAME given_name TO first_name;

ALTER TABLE cif.cif_user
RENAME family_name TO last_name;

COMMIT;
