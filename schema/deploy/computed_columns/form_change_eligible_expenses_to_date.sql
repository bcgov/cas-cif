-- Deploy cif:computed_columns/form_change_eligible_expenses_to_date to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_eligible_expenses_to_date(parameter_fc cif.form_change)
returns numeric as
$fn$

  select
    round(sum((fc.new_form_data->>'totalEligibleExpenses')::numeric), 2)
    from cif.form_change fc
    where fc.project_revision_id = parameter_fc.project_revision_id
    and (fc.new_form_data->>'hasExpenses')::boolean = true
    and (fc.new_form_data->>'reportDueDate')::timestamptz <= (parameter_fc.new_form_data->>'reportDueDate')::timestamptz;

$fn$ language sql stable;

commit;
