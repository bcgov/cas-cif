-- Deploy cif:computed_columns/form_change_actual_performance_milestone_amount to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_actual_performance_milestone_amount(fc cif.form_change)
returns numeric
as
$computed_column$

  select case
    when cif.form_change_payment_percentage($1) is null or cif.form_change_holdback_amount_to_date($1) is null then null
    else cif.form_change_holdback_amount_to_date($1) * cif.form_change_payment_percentage($1) / 100
  end;

$computed_column$ language sql stable;

comment on function cif.form_change_actual_performance_milestone_amount is
$$
    Computed column to return the actual performance milestone amount.
    Calculation:
    - Actual Performance Milestone Amount = (Maximum Performance Milestone Amount * Payment Percentage Of Performance Milestone Amount) / 100
    - Maximum Performance Milestone Amount is Holdback Amount To Date on front end code
$$;

commit;
