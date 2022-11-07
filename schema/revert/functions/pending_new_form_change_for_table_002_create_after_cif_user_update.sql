-- Revert cif:functions/pending_new_form_change_for_table_002_create_after_cif_user_update from pg

begin;

drop function cif.pending_new_form_change_for_table;

commit;
