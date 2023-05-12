
begin;

select plan(3);

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
    (
      1,
      'create',
      'cif',
      'project_attachment',
      1,
      1,
      'project_attachment',
      '{
        "projectId": 1,
        "attachmentId": 1
      }'
    ),
    (2, 'create', 'cif', 'operator', 1, 1, 'operator', '{"legalName": "I am an operator"}');
/** SETUP END **/


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    ) select pg_typeof(cif.form_change_as_project_attachment((select * from record)))::text
  ),
  (
    'cif.project_attachment'::text
  ),
  'Returns a record of type project_attachment'
);

select results_eq(
  $$
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    )
    select
      id,
      project_id,
      attachment_id
    from cif.form_change_as_project_attachment((select * from record))
  $$,
  $$
    values (
      -1::int,
      1::int,
      1::int
      )
  $$,
  'Returns a record populated with the data from the form_change''s new_form_data field, and id of -1'
);


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select id from cif.form_change_as_project_attachment((select * from record))
  ),
  null,
  'Returns null when passed a form_change record with a form_data_table_name that is not project_attachment'
);


select finish();

rollback;
