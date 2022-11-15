-- Deploy cif:computed_columns/form_change_gross_payments_to_date to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_gross_payments_to_date(parameter_fc cif.form_change)
returns numeric as
$fn$

  select
    round(sum(coalesce((fc.new_form_data->>'adjustedGrossAmount')::numeric, (fc.new_form_data->>'calculatedGrossAmount')::numeric)), 2)
    from cif.form_change fc
    where fc.project_revision_id = $1.project_revision_id
    and (fc.new_form_data->>'hasExpenses')::boolean = true
    and (fc.new_form_data->>'reportDueDate')::timestamptz <= ($1.new_form_data->>'reportDueDate')::timestamptz;

$fn$ language sql stable;

commit;
