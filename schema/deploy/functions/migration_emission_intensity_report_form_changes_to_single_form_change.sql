-- Deploy cif:functions/migration_emission_intensity_report_form_changes_to_single_form_change to pg

begin;

create or replace function cif_private.migration_emission_intensity_report_form_changes_to_single_form_change()
returns void as
$migration$


with
  raw_ei_data as
        (
          select id, new_form_data, project_revision_id, (new_form_data->>'reportingRequirementId')::int as rep_req_id
          from cif.form_change
          where json_schema_name = 'emission_intensity_report'
        ),
  -- Some form changes have nested, duplicated key-value pairs. This CTE standardizes the new_form_data structure
  ei_data as
        (
          select id, project_revision_id, rep_req_id,  jsonb_strip_nulls(jsonb_build_object(
              'measurementPeriodStartDate', raw_ei_data.new_form_data->>'measurementPeriodStartDate',
              'measurementPeriodEndDate', raw_ei_data.new_form_data->>'measurementPeriodEndDate',
              'emissionFunctionalUnit', raw_ei_data.new_form_data->>'emissionFunctionalUnit',
              'productionFunctionalUnit', raw_ei_data.new_form_data->>'productionFunctionalUnit',
              'baselineEmissionIntensity', raw_ei_data.new_form_data->>'baselineEmissionIntensity',
              'targetEmissionIntensity', raw_ei_data.new_form_data->>'targetEmissionIntensity',
              'postProjectEmissionIntensity', raw_ei_data.new_form_data->>'postProjectEmissionIntensity',
              'totalLifetimeEmissioSnReduction',  raw_ei_data.new_form_data->>'totalLifetimeEmissioSnReduction',
              'adjustedEmissionsIntensityPerformance', raw_ei_data.new_form_data->>'adjustedEmissionsIntensityPerformance',
              'adjustedHoldbackPaymentAmount', raw_ei_data.new_form_data->>'adjustedHoldbackPaymentAmount',
              'dateSentToCsnr', raw_ei_data.new_form_data->>'dateSentToCsnr'))::jsonb
            as clean_new_form_data
        from raw_ei_data
        )

  update cif.form_change fc1
      set
        -- Need to rewrite rather than just copy the new_form_data because project id key was project_id instead of projectId
        new_form_data =  jsonb_strip_nulls(jsonb_build_object(
          'projectId', new_form_data->>'project_id',
          'reportType', new_form_data->>'reportType',
          'reportDueDate', new_form_data->>'reportDueDate',
          'submittedDate', new_form_data->>'submittedDate',
          'comments', new_form_data->>'comments',
          'reportingRequirementIndex', new_form_data->>'reportingRequirementIndex'
        ))::jsonb || (
                select clean_new_form_data from ei_data
                where ei_data.rep_req_id = fc1.form_data_record_id
                and ei_data.project_revision_id = fc1.project_revision_id
                and ei_data.rep_req_id is not null
              ),
        json_schema_name = 'emission_intensity'
      where json_schema_name = 'emission_intensity_reporting_requirement';

delete from cif.form_change
    where json_schema_name = 'emission_intensity_report';

$migration$ language sql volatile;

commit;
