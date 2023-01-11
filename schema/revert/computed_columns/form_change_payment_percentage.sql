-- Revert cif:computed_column/form_change_payment_percentage from pg

begin;

drop function cif.form_change_payment_percentage(cif.form_change);

commit;
