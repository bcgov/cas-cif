-- Revert cif:computed_columns/contact_pending_form_change_002_create_after_cif_user_update from pg

begin;

drop function cif.contact_pending_form_change;

commit;
