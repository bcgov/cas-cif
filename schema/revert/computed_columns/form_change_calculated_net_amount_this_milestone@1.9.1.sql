-- Deploy cif:computed_columns/form_change_calculated_net_amount_this_milestone to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_calculated_net_amount_this_milestone(fc cif.form_change)
returns numeric
as
$fn$

  select case
    when ($1.new_form_data->>'hasExpenses')::boolean = false then 0
    when ($1.new_form_data->>'hasExpenses')::boolean = true then
      (
        coalesce(
          ($1.new_form_data->>'adjustedGrossAmount')::numeric, cif.form_change_calculated_gross_amount_this_milestone($1)
        )
        -
        coalesce(
          ($1.new_form_data->>'adjustedHoldbackAmount')::numeric, cif.form_change_calculated_holdback_amount_this_milestone($1)
        )
      )
  end;

$fn$ language sql stable;

comment on function cif.form_change_calculated_net_amount_this_milestone(cif.form_change) is 'Computed column returns the calculated net payment amount for a particular milestone based on the adjusted or calculated holdback amount and adjusted or calculated gross amount for the milestone with priority given to the adjusted amounts.';

commit;
