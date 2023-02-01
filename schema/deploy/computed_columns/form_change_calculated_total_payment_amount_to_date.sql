-- Deploy cif:computed_columns/form_change_calculated_total_payment_amount_to_date from pg

begin;

create or replace function cif.form_change_calculated_total_payment_amount_to_date(cif.form_change)
returns numeric
as
$fn$

-- TODO: placeholder
select 0;

$fn$ language sql stable;

comment on function cif.form_change_calculated_total_payment_amount_to_date(cif.form_change) is 'Computed column to calculate the total payment amount to date for an IA project.';

commit;
