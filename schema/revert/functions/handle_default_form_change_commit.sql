-- Revert cif:functions/handle_default_form_change_commit from pg

begin;

drop function cif_private.handle_default_form_change_commit;

commit;
