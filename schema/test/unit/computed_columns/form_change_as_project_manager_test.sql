

begin;

select plan(2);

/** SETUP **/
truncate table cif.change_status restart identity cascade;

insert into cif.change_status (status, triggers_commit, active)
values
  ('pending', false, true);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.form_change(id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, json_schema_name, new_form_data)
  overriding system value
  values
    (1, 'create', 'cif', 'project_manager', 1, 1, 'project_manager', '{"projectId": 1, "cifUserId": 1, "projectManagerLabelId": 1}'),
    (2, 'create', 'cif', 'operator', 1, 1, 'operator', '{"legalName": "I am an operator"}');
/** SETUP END **/

select results_eq(
  $$
  with record as (
  select row(form_change.*)::cif.form_change
  from cif.form_change where id=1
  ) select project_id, cif_user_id, project_manager_label_id from cif.form_change_as_project_manager((select * from record))
  $$,
  $$
  values(1::int, 1::int, 1::int)
  $$,
  'Returns a record with the correct data when passed a form_change record with a form_data_table_name of project_manager'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select id from cif.form_change_as_project_manager((select * from record))
  ),
  null,
  'Returns null when passed a form_change record with a form_data_table_name that is not project_manager'
);

select finish();

rollback;
