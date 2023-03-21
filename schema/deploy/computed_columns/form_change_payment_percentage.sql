-- Deploy cif:functions/form_change_payment_percentage to pg
-- requires: tables/form_change
-- requires: computed_columns/emission_intensity_report_calculated_ei_performance
-- 100 – ((-1.5) x GHG Emission Intensity Performance + 145), values capped at 0 and 100

begin;

create or replace function cif.form_change_payment_percentage(fc cif.form_change)
returns numeric as
$fn$

-- We need a case here becase greatest() and least() will ignore null values, while we care
-- about returning null if both values are null.
select case when (($1.new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric is null
and cif.form_change_calculated_ei_performance($1) is null)
  then null
  else
    greatest(
      least(
        round(
          100 - ((-1.5) *
          coalesce(
            ($1.new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric,
            (cif.form_change_calculated_ei_performance($1))
          )
        + 145),
        2
        ),
        100
      ),
      0
    )
end;

$fn$ language sql stable;

comment on function cif.form_change_payment_percentage(cif.form_change) is 'Computed column that returns the payment percentage of a performance milestone.';

commit;
