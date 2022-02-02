-- Revert cif:functions/pending_new_contact_form_change from pg

begin;

drop function cif.pending_new_contact_form_change();

commit;
