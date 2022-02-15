-- Revert cif:trigger_functions/protect_manually_updated_operator_data from pg

begin;

drop function cif_private.protect_manually_updated_operator_data;

commit;
