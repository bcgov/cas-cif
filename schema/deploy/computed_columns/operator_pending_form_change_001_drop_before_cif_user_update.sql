-- Deploy cif:computed_columns/operator_pending_form_change_001_drop_before_cif_user_update to pg
-- requires: computed_columns/operator_pending_form_change

begin;

drop function cif.operator_pending_form_change;

commit;
