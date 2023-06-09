-- Deploy cif:functions/migration_emission_intensity_report_form_changes_to_single_form_change to pg

begin;

create or replace function cif_private.migration_emission_intensity_report_form_changes_to_single_form_change()
returns void as
$migration$

   with ei_form_changes as (
    select
      reporting_requirement_form_change.id as reporting_requirement_id,
      coalesce(reporting_requirement_form_change.new_form_data, '{}'::jsonb) as reporting_requirement_data,
      ei_form_change.id as ei_id,
      coalesce(ei_form_change.new_form_data, '{}'::jsonb) as ei_data
    from cif.form_change as reporting_requirement_form_change
    left join cif.form_change as ei_form_change
      on (ei_form_change.new_form_data->>'reportingRequirementId')::numeric = reporting_requirement_form_change.form_data_record_id
      and (ei_form_change.new_form_data->>'reportingRequirementId')::numeric is not null
    where reporting_requirement_form_change.form_data_table_name = 'reporting_requirement'
      and reporting_requirement_form_change.json_schema_name = 'reporting_requirement'
      and reporting_requirement_form_change.new_form_data->>'reportType' in ('TEIMP')
  ),
  new_data as (
      select
        reporting_requirement_id as id,
        jsonb_strip_nulls(
          jsonb_build_object(
            -- reporting requirement data
            'reportType', reporting_requirement_data->'reportType',
            'reportDueDate', reporting_requirement_data->'reportDueDate',
            'submittedDate', reporting_requirement_data->'submittedDate',
            'comments', reporting_requirement_data->'comments',
            'reportingRequirementIndex', reporting_requirement_data->'reportingRequirementIndex',
            -- ei report data
            'measurement_period_start_date', ei_data->'measurement_period_start_date',
            'measurement_period_end_date', ei_data->'measurement_period_end_date',
            'emission_functional_unit', ei_data->'emission_functional_unit',
            'production_functional_unit', ei_data->'production_functional_unit',
            'baseline_emission_intensity', ei_data->'baseline_emission_intensity',
            'target_emission_intensity', ei_data->'target_emission_intensity',
            'post_project_emission_intensity', ei_data->'post_project_emission_intensity',
            'total_lifetime_emission_reduction', ei_data->'total_lifetime_emission_reduction',
            'adjusted_emissions_intensity_performance', ei_data->'adjusted_emissions_intensity_performance',
            'adjusted_holdback_payment_amount', ei_data->'adjusted_holdback_payment_amount',
            'date_sent_to_csnr', ei_data->'date_sent_to_csnr'
          )
        ) as new_form_data
      from ei_form_changes
  ),
  deleted_form_changes as (
    delete from cif.form_change where id in (
      select ei_id as id from ei_form_changes
    ) returning *
  )
  update cif.form_change fc
  set
    new_form_data = new_data.new_form_data,
    json_schema_name = 'reporting_requirement'
  from new_data
  where fc.id=new_data.id;


$migration$ language sql volatile;

commit;
