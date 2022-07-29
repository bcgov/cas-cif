-- Deploy cif:mutations/add_emission_intensity_report_to_revision to pg
-- requires: tables/reporting_requirement
-- requires: tables/form_change

begin;

/**
  Adding a emission intensity report to a project_revision is a chained operation. The data for emission is spread across two tables:
    - reporting_requirement (base table, common to all reports)
    - emission_intensity_report (data specific to emission intensity reports)
  Because this data is spread across two tables we have to create two form_change records within one transaction, one for each table.
**/

create or replace function cif.add_emission_intensity_report_to_revision(revision_id int)
returns setof cif.form_change
as $add_emission_intensity_form_change$
  with rep_req as (
    insert into cif.form_change(
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name
    ) values (
        format(
          '{"project_id": %s, "reportType": "%s", "reportingRequirementIndex": %s }',
          (select form_data_record_id from cif.form_change where form_data_schema_name='cif' and form_data_table_name='project' and project_revision_id=$1),
          'TEIMP',
          1
        )::jsonb,
        'create',
        'cif',
        'reporting_requirement',
        (select nextval(pg_get_serial_sequence('cif.reporting_requirement', 'id'))),
        $1,
        'pending',
        'reporting_requirement'
      ) returning *
  ), emission_intensity_report as (
      insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        project_revision_id,
        change_status,
        json_schema_name
      ) values (
          format(
            '{"reportingRequirementId": %s, "emissionFunctionalUnit": "tCO2e" }',
            (select form_data_record_id from rep_req)
          )::jsonb,
          'create',
          'cif',
          'emission_intensity_report',
          $1,
          'pending',
          'emission_intensity_report'
        ) returning *
    ) select * from rep_req union select * from emission_intensity_report;

$add_emission_intensity_form_change$ language sql volatile;

grant execute on function cif.add_emission_intensity_report_to_revision to cif_internal, cif_external, cif_admin;
grant usage, select on sequence cif.reporting_requirement_id_seq to cif_internal, cif_external, cif_admin;

commit;
