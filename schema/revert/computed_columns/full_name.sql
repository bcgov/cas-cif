-- Revert cif:computed_columns/full_name from pg

BEGIN;

drop function cif.full_name(anyelement);

COMMIT;
