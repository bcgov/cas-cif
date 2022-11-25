-- Verify cif:mutations/discard_additional_funding_source_form_change on pg

begin;

select pg_get_functiondef('cif.discard_additional_funding_source_form_change(int, int)'::regprocedure);

rollback;
