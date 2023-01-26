-- Verify cif:mutations/discard_funding_parameter_form_change on pg

begin;

select pg_get_functiondef('cif.discard_funding_parameter_form_change(int)'::regprocedure);

rollback;
