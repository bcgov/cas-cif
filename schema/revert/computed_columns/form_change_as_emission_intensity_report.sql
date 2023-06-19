-- Deploy cif:computed_columns/form_change_as_emission_intensity_report to pg

begin;

/**
  The revert for the preceding change emission_intensity_report_001 must be done here or the revert for form_change_as_emission_intensity_report
  will not work. It will complain that it is returning too few columns.
**/

alter table cif.emission_intensity_report
  drop column if exists adjusted_holdback_payment_amount,
  drop column if exists date_sent_to_csnr;

create or replace function cif.form_change_as_emission_intensity_report(cif.form_change)
returns cif.emission_intensity_report
as $$
    select
      /**
        Given form_data_record_id can be null for some form_change records, it is not a reliable id value for the returned project_contact record.
        The returned id must not be null, so we use the form_change id being passed in as a parameter (multiplied by -1 to ensure we are not touching any existing records).
        This means the id value is not going to be the correct id for the returned emission_intensity_report record, which should be ok since we're only interested
        in the data in new_form_data.
      **/
      ($1.id * -1) as id,
      (new_form_data->>'reportingRequirementId')::integer as reporting_requirement_id,
      (new_form_data->>'measurementPeriodStartDate')::timestamptz as measurement_period_start_date,
      (new_form_data->>'measurementPeriodEndDate')::timestamptz as measurement_period_end_date,
      (new_form_data->>'emissionFunctionalUnit')::varchar as emission_functional_unit,
      (new_form_data->>'productionFunctionalUnit')::varchar as production_functional_unit,
      (new_form_data->>'baselineEmissionIntensity')::numeric as baseline_emission_intensity,
      (new_form_data->>'targetEmissionIntensity')::numeric as target_emission_intensity,
      (new_form_data->>'postProjectEmissionIntensity')::numeric as post_project_emission_intensity,
      (new_form_data->>'totalLifetimeEmissionReduction')::numeric as total_lifetime_emission_reduction,
      (new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric as adjusted_emissions_intensity_performance,
      null::int as created_by,
      now()::timestamptz created_at,
      null::int as updated_by,
      now()::timestamptz updated_at,
      null::int as archived_by,
      null::timestamptz as archived_at
    from cif.form_change fc where fc.id = $1.id and fc.form_data_table_name = 'emission_intensity_report'

$$ language sql stable;

comment on function cif.form_change_as_reporting_requirement(cif.form_change) is 'Computed column returns data from the new_form_data column as if it were a emission_intensity_report record to allow graph traversal via the foreign keys.';

commit;
