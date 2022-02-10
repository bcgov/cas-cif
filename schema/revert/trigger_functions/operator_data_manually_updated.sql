-- Revert cif:trigger_functions/operator_data_manually_updated from pg

begin;

drop function cif_private.operator_data_manually_updated;

commit;
