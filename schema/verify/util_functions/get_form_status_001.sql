-- Verify cif:util_functions/get_form_status_001 on pg

begin;

select pg_get_functiondef('cif.get_form_status(int,text,jsonb)'::regprocedure);

rollback;
