
begin;

select plan(2);

truncate cif.project restart identity cascade;
select cif.create_project(1);

-- it inserts a new record
select cif.add_contact_to_revision((select id from cif.project_revision order by id desc limit 1), 1);
select is(
  (select count(*) from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1) and form_data_table_name='project_contact'),
  1::bigint,
  'There should be 1 project_contact record'
);

-- it returns the newly inserted record with the
select results_eq(
  $$
    select
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name
    from cif.add_contact_to_revision((select id from cif.project_revision order by id desc limit 1), 2, 1)
  $$,
  $$
    values(
      '{"contactId": 1, "projectId": 1, "contactIndex": 2}'::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'project_contact'::varchar,
      null::integer,
      (select id from cif.project_revision order by id desc limit 1),
      'pending'::varchar,
      'project_contact'::varchar
    )
  $$,
  'The newly inserted record should be returned'
);

select finish();


rollback;
