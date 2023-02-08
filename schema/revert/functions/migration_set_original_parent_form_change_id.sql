-- Revert cif:functions/migration_set_original_parent_form_change_id from pg

begin;

drop function cif_private.migration_set_original_parent_form_change_id;

commit;
