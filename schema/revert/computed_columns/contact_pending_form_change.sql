-- Revert cif:computed_columns/contact_pending_form_change from pg

begin;

drop function cif.contact_pending_form_change(cif.contact);

commit;
