-- Deploy cif:computed_columns/contact_pending_form_change_001_drop_before_cif_user_update to pg

begin;

drop function cif.contact_pending_form_change;

commit;
