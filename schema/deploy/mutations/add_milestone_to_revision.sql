-- Deploy cif:mutations/add_milestone_to_revision to pg
-- requires: tables/reporting_requirement
-- requires: tables/form_change

begin;

create or replace function cif.add_milestone_to_revision(revision_id int, reporting_requirement_index int)
returns setof cif.form_change
as $add_milestone_form_change$
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
          (select name from cif.report_type where is_milestone = true order by name limit 1),
          $2
        )::jsonb,
        'create',
        'cif',
        'reporting_requirement',
        (select nextval(pg_get_serial_sequence('cif.reporting_requirement', 'id'))),
        $1,
        'pending',
        'reporting_requirement'
      ) returning form_data_record_id
  ), milestone as (
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
          'milestone_report',
          $1,
          'pending',
          'milestone_report'
        ) returning new_form_data->>'reportingRequirementId' as rep_req_id
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
                (select rep_req_id from milestone)
              )::jsonb,
              'create',
              'cif',
              'payment',
              $1,
              'pending',
              'payment'
            ) returning new_form_data->>'reportingRequirementId' as rep_req_id
        ) select * from cif.form_change where project_revision_id = $1
          and ((form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = reporting_requirement_index)
          or (form_data_table_name in ('milestone_report', 'payment') and new_form_data->>'reportingRequirementId' = (select rep_req_id from payment)));
$add_milestone_form_change$ language sql volatile;

commit;
