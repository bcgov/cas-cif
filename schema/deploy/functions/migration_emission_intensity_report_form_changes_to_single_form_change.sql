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
              'measurementPeriodStartDate', (raw_ei_data.new_form_data->>'measurementPeriodStartDate')::timestamptz,
              'measurementPeriodEndDate', (raw_ei_data.new_form_data->>'measurementPeriodEndDate')::timestamptz,
              'emissionFunctionalUnit', (raw_ei_data.new_form_data->>'emissionFunctionalUnit')::varchar,
              'productionFunctionalUnit', (raw_ei_data.new_form_data->>'productionFunctionalUnit')::varchar,
              'baselineEmissionIntensity', (raw_ei_data.new_form_data->>'baselineEmissionIntensity')::numeric,
              'targetEmissionIntensity', (raw_ei_data.new_form_data->>'targetEmissionIntensity')::numeric,
              'postProjectEmissionIntensity', (raw_ei_data.new_form_data->>'postProjectEmissionIntensity')::numeric,
              'totalLifetimeEmissionReduction',  (raw_ei_data.new_form_data->>'totalLifetimeEmissionReduction')::numeric,
              'adjustedEmissionsIntensityPerformance', (raw_ei_data.new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric,
              'adjustedHoldbackPaymentAmount', (raw_ei_data.new_form_data->>'adjustedHoldbackPaymentAmount')::numeric,
              'dateSentToCsnr', (raw_ei_data.new_form_data->>'dateSentToCsnr')::timestamptz)
              )::jsonb
            as clean_new_form_data
        from raw_ei_data
        )

  update cif.form_change fc1
      set
        -- Need to rewrite rather than just copy the new_form_data because project id key was project_id instead of projectId
        new_form_data =  jsonb_strip_nulls(jsonb_build_object(
          'projectId', (new_form_data->>'project_id')::int,
          'reportType', (new_form_data->>'reportType')::varchar,
          'reportDueDate', (new_form_data->>'reportDueDate')::timestamptz,
          'submittedDate', (new_form_data->>'submittedDate')::timestamptz,
          'comments', (new_form_data->>'comments')::varchar,
          'reportingRequirementIndex', (new_form_data->>'reportingRequirementIndex')::int
        ))::jsonb || (
                select clean_new_form_data from ei_data
                where ei_data.rep_req_id = fc1.form_data_record_id
                and ei_data.project_revision_id = fc1.project_revision_id
                and ei_data.rep_req_id is not null
              ),
        json_schema_name = 'emission_intensity'
      where (new_form_data->>'reportType')::text = 'TEIMP';

delete from cif.form_change where json_schema_name = 'emission_intensity_report';

delete from cif.form where slug='emission_intensity_report';
delete from cif.form where slug='emission_intensity_reporting_requirement';

$migration$ language sql volatile;

commit;
