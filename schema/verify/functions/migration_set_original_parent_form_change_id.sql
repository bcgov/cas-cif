-- Verify cif:functions/migration_set_original_parent_form_change_id on pg

begin;

select pg_get_functiondef('cif_private.migration_set_original_parent_form_change_id()'::regprocedure);

rollback;
