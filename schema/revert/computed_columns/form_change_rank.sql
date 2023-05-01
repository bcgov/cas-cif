-- Revert cif:computed_columns/form_change_rank from pg

begin;

drop function cif.form_change_rank(cif.form_change);

commit;
