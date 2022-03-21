-- Verify cif:computed_column/full_name on pg

BEGIN;

select pg_get_functiondef('cif.full_name(anyelement)'::regprocedure);

ROLLBACK;
