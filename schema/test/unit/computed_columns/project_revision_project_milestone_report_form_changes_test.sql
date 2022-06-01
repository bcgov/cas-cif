begin;

select plan(2);

/** SETUP */

truncate cif.project_revision restart identity cascade;

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending');
insert into cif.form_change(id, new_form_data, operation, form_data_schema_name, form_data_table_name, project_revision_id,json_schema_name)
  overriding system value
  values
    (1, '{"reportType":"Quarterly"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (2, '{"reportType":"General Milestone"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (3, '{"reportType":"Advanced Milestone"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (4, '{"reportType":"Reporting Milestone"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (5, '{"reportType":"Quarterly"}','create', 'cif', 'reporting_requirement', 2, 'reporting_requirement');

/** END SETUP */

select results_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select new_form_data->>'reportType' from cif.project_revision_project_milestone_report_form_changes((select * from record)) order by id
  $$,
  $$
    values ('General Milestone'::text), ('Advanced Milestone'::text), ('Reporting Milestone'::text)
  $$,
  'Only returns the milestone form change records from the reporting_requirement table'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select new_form_data->>'reportType' from cif.project_revision_project_milestone_report_form_changes((select * from record))
  ),
  null,
  'Returns null if there are no milestone reports for that project revision'
);

select finish();

rollback;
