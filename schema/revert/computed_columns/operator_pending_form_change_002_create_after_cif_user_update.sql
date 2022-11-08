-- Revert cif:computed_columns/operator_pending_form_change_002_create_after_cif_user_update from pg

begin;

drop function cif.operator_pending_form_change;

commit;
