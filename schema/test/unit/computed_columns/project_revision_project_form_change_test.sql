

begin;

select plan(2);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending');
insert into cif.form(slug, json_schema, description) values ('some_other_table', '{}'::jsonb, 'test description');
insert into cif.form_change(id, operation, form_data_schema_name, form_data_table_name, project_revision_id,json_schema_name)
  overriding system value
  values
    (1, 'create', 'cif', 'project', 1, 'project'),
    (2, 'create', 'cif', 'some_other_table', 1, 'some_other_table'),
    (3, 'create', 'test_schema_name', 'project', 1, 'project');

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select form_data_table_name from cif.project_revision_project_form_change((select * from record))
  ),
  'project',
  'Only returns the form change record for the project table'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select form_data_table_name from cif.project_revision_project_form_change((select * from record))
  ),
  null,
  'Returns null if there is no form change for the project table'
);

select finish();

rollback;
