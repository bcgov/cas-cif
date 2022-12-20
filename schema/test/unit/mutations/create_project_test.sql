

begin;

select plan(4);

truncate table cif.project restart identity cascade;
truncate table cif.project_revision restart identity cascade;
truncate table cif.form_change restart identity cascade;

alter sequence cif.project_id_seq restart with 1234;
-- This test calls the create_project(funding_stream_rpf_id integer) function,
-- effects will be tested in the following tests
select lives_ok(
  $$
    select row(created_revision.*)::cif.project_revision from cif.create_project(1) as created_revision;
  $$,
  'Returns the created project_revision row with the right type'
);

select results_eq(
  $$
    select id, project_id, change_status, revision_status from cif.project_revision;
  $$,
  $$
    values (1, null::integer, 'pending'::varchar,'Draft'::varchar);
  $$,
  'Creates a revision with null project_id and status pending'
);

select results_eq(
  $$
    select form_data_table_name, form_data_schema_name, project_revision_id, new_form_data from cif.form_change;
  $$,
  $$
    values
      ('project'::varchar, 'cif'::varchar, 1::integer, '{"fundingStreamRfpId": 1}'::jsonb)
  $$,
  'Creates 1 form_change records for the project table'
);

-- creating a second project to test the sequences
select cif.create_project(2);

select is(
  (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=2),
  (select currval(pg_get_serial_sequence('cif.project', 'id'))::integer),
  'Reserves the next id in the sequence for the the project table'
);

select finish();
rollback;
