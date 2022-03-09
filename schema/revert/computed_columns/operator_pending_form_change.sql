-- Revert cif:computed_columns/operator_pending_form_change from pg

begin;

drop function cif.operator_pending_form_change(cif.operator);

commit;
