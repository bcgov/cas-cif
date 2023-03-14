-- Deploy cif:functions/form_change_payment_percentage to pg
-- requires: tables/form_change
-- requires: computed_columns/emission_intensity_report_calculated_ei_performance
-- 100 – ((-1.5) x GHG Emission Intensity Performance + 145)

begin;

create or replace function cif.form_change_payment_percentage(fc cif.form_change)
returns numeric as
$fn$

  select
    greatest(
      least(
        round(
          100 - ((-1.5) *
          coalesce(
            (fc.new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric,
            (cif.form_change_calculated_ei_performance(fc))
          )
        + 145),
        2
        ),
        100
      ),
      0
    );

$fn$ language sql stable;

comment on function cif.form_change_payment_percentage(cif.form_change) is 'Computed column that returns the payment percentage of a performance milestone.';

commit;
