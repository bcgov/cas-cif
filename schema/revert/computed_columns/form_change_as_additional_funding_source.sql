-- Revert cif:computed_columns/form_change_as_additional_funding_source from pg

begin;

drop function cif.form_change_as_additional_funding_source(cif.form_change);

commit;
