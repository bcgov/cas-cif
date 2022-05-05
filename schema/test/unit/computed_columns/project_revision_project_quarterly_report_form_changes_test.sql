begin;

select plan(2);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending'), (3, 'pending');
insert into cif.form_change(id, new_form_data, operation, form_data_schema_name, form_data_table_name, project_revision_id,json_schema_name)
  overriding system value
  values
    (1, '{"reportType":"Not Quarterly","testData": "record for not quarterly report"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (2, '{"reportType":"Quarterly","testData": "record for some_other_table"}','create', 'cif', 'some_other_table', 1, 'some_other_table'),
    (3, '{"reportType":"Quarterly", "testData": "record for quarterly report"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (4, '{"reportType":"Quarterly", "testData": "record for quarterly report"}','create', 'cof', 'reporting_requirement', 1, 'reporting_requirement'),
    (5, '{"reportType":"Quarterly", "testData": "record for quarterly report on other revision"}','create', 'cif', 'reporting_requirement', 2, 'reporting_requirement'),
    (6, '{"reportType":"Not Quarterly", "testData": "record for quarterly report on other revision"}','create', 'cif', 'reporting_requirement', 2, 'reporting_requirement'),
    (7, '{"reportType":"Not Quarterly", "testData": "record for quarterly report on other revision"}','create', 'cif', 'reporting_requirement', 3, 'reporting_requirement');

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select new_form_data->>'testData' from cif.project_revision_project_quarterly_report_form_changes((select * from record))
  ),
  'record for quarterly report',
  'Only returns the form change record for the revision and the project quarterly report table'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select new_form_data->>'testData' from cif.project_revision_project_quarterly_report_form_changes((select * from record))
  ),
  null,
  'Returns null if there are no quarterly reports for that project revision'
);

select finish();

rollback;
