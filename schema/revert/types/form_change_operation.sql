-- Revert cif:types/form_change_operation from pg

begin;

drop type cif.form_change_operation;

commit;
