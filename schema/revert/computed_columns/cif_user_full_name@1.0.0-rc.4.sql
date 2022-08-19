-- Revert cif:computed_columns/full_name from pg

BEGIN;

drop function cif.cif_user_full_name(cif.cif_user);

COMMIT;
