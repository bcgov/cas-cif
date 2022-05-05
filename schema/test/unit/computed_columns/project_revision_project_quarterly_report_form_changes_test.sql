begin;

select plan(1);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending');
insert into cif.form_change(id, new_form_data, operation, form_data_schema_name, form_data_table_name, project_revision_id,json_schema_name)
  overriding system value
  values
    (1, '{"report_type":"Not Quarterly","test_data": "record for not quarterly report"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (2, '{"report_type":"Quarterly","test_data": "record for some_other_table"}','create', 'cif', 'some_other_table', 1, 'some_other_table'),
    (3, '{"report_type":"Quarterly", "test_data": "record for quarterly report"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (4, '{"report_type":"Quarterly", "test_data": "record for quarterly report on other revision"}','create', 'cif', 'reporting_requirement', 2, 'reporting_requirement');


select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select new_form_data->>'test_data' from cif.project_revision_project_quarterly_report_form_changes((select * from record))
  ),
  'record for quarterly report',
  'Only returns the form change record for the project quarterly report table'
);

select finish();

rollback;
