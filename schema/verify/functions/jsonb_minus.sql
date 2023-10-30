-- Verify cif:functions/jsonb_minus on pg

begin;

select pg_get_functiondef('cif.jsonb_minus(jsonb, jsonb)'::regprocedure);

rollback;
