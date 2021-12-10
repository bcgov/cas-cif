

begin;

select plan(5);

truncate table cif.project restart identity cascade;
truncate table cif.project_manager restart identity cascade;
truncate table cif.project_revision restart identity cascade;
truncate table cif.form_change restart identity cascade;

-- This test calls the create_project() function,
-- effects will be tested in the following tests
select lives_ok(
  $$
    select row(created_revision.*)::cif.project_revision from cif.create_project() as created_revision;
  $$,
  'Returns the created project_revision row with the right type'
);

select results_eq(
  $$
    select id, project_id, change_status from cif.project_revision;
  $$,
  $$
    values (1, null::integer, 'pending'::varchar);
  $$,
  'Creates a revision with null project_id and status pending'
);

select results_eq(
  $$
    select form_data_table_name, form_data_schema_name, project_revision_id from cif.form_change;
  $$,
  $$
    values
      ('project'::varchar, 'cif'::varchar, 1::integer),
      ('project_manager'::varchar, 'cif'::varchar, 1::integer);
  $$,
  'Creates two form_change for the project and the project_manager tables'
);

-- creating a second project to test the sequences
select cif.create_project();

select is(
  (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=2),
  (select currval(pg_get_serial_sequence('cif.project', 'id'))::integer),
  'Reserves the next id in the sequence for the the project table'
);

select is(
  (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=2),
  (select currval(pg_get_serial_sequence('cif.project_manager', 'id'))::integer),
  'Reserves the next id in the sequence for the the project_manager table'
);

select finish();
rollback;
