-- Deploy cif:mutations/add_project_summary_report_to_revision to pg
-- requires: tables/reporting_requirement
-- requires: tables/form_change

begin;

/**
  Adding a project summary report to a project_revision is a chained operation. The data for project summary is spread across two tables:
    - reporting_requirement (base table, common to all reports)
    - payment (payment data, common to some reports)
  Because this data is spread across two tables we have to create two form_change records within one transaction, one for each table.
**/

create or replace function cif.add_project_summary_report_to_revision(revision_id int, reporting_requirement_index int)
returns setof cif.form_change
as $add_project_summary_form_change$
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
          'Project Summary Report',
          $2
        )::jsonb,
        'create',
        'cif',
        'reporting_requirement',
        (select nextval(pg_get_serial_sequence('cif.reporting_requirement', 'id'))),
        $1,
        'pending',
        'reporting_requirement'
      ) returning *
  ), payment as (
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
                '{"reportingRequirementId": %s }',
                (select form_data_record_id from rep_req)
              )::jsonb,
              'create',
              'cif',
              'payment',
              $1,
              'pending',
              'payment'
            ) returning *
        ) select * from rep_req union select * from payment;

$add_project_summary_form_change$ language sql volatile;

grant execute on function cif.add_project_summary_report_to_revision to cif_internal, cif_external, cif_admin;
grant usage, select on sequence cif.reporting_requirement_id_seq to cif_internal, cif_external, cif_admin;


commit;
