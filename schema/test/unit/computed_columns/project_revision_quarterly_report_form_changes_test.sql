begin;

select plan(10);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending');
insert into cif.form_change(id, new_form_data, operation, form_data_schema_name, form_data_table_name, project_revision_id,json_schema_name)
  overriding system value
  values
    (1, '{"report_type":"Not Quarterly"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (2, '{"report_type":"Quarterly"}','create', 'cif', 'some_other_table', 1, 'some_other_table'),
    (3, '{"report_type":"Quarterly"}','create', 'reporting_requirement', 'project', 1, 'reporting_requirement');


select finish();

rollback;
