-- Deploy cif:computed_columns/form_change_calculated_holdback_amount_this_milestone to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_calculated_holdback_amount_this_milestone(fc cif.form_change)
returns numeric
as
$fn$

  select case
    when ($1.new_form_data->>'hasExpenses')::boolean = false then 0
    when ($1.new_form_data->>'reportType')::text in ('General Milestone', 'Interim Summary Report') and ($1.new_form_data->>'totalEligibleExpenses')::numeric is null then null
    when ($1.new_form_data->>'hasExpenses')::boolean = true and ($1.new_form_data->>'submittedDate')::timestamptz is not null then
      (
        coalesce(
          ($1.new_form_data->>'adjustedGrossAmount')::numeric, cif.form_change_calculated_gross_amount_this_milestone($1)
        )
        *
        ((select new_form_data->>'holdbackPercentage' from cif.form_change where project_revision_id=$1.project_revision_id and form_data_table_name='funding_parameter')::numeric / 100)
      )
    else null
  end;

$fn$ language sql stable;

comment on function cif.form_change_calculated_holdback_amount_this_milestone(cif.form_change) is 'Computed column returns the calculated holdback amount for a particular milestone based on the holdback percentage for the project and adjusted or calculated gross amount for the milestone with priority given to the adjusted amount.';

commit;
