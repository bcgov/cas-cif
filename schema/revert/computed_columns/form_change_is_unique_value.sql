-- Revert cif:computed_columns/form_change_is_unique_value from pg

begin;

drop function cif.form_change_is_unique_value(cif.form_change, text);

commit;
