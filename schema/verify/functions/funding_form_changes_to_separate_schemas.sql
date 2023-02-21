-- Verify cif:functions/funding_form_changes_to_separate_schemas on pg

begin;

select pg_get_functiondef('cif_private.funding_form_changes_to_separate_schemas()'::regprocedure);

rollback;
