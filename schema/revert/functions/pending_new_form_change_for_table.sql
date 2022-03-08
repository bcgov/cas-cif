-- Revert cif:functions/pending_new_form_change_for_table from pg

begin;

drop function cif.pending_new_form_change_for_table(text);

commit;
