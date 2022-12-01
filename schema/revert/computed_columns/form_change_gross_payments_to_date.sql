-- Revert cif:computed_columns/form_change_gross_payments_to_date from pg

begin;

drop function cif.form_change_gross_payments_to_date(cif.form_change);

commit;
