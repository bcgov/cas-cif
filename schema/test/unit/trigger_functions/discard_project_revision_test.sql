

begin;

select plan(2);


insert into cif.project_revision (
  change_status
) values
('pending'),('pending');

insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  form_data_record_id,
  project_revision_id,
  change_status,
  change_reason
) values (
  '{"revision": "one" }',
  'UPDATE',
  'fake_schema',
  'fake_table',
  999,
  (select id from cif.project_revision order by id desc limit 1),
  'pending',
  'Testing form_change delete propagation'
),(
  '{"revision": "two" }',
  'UPDATE',
  'fake_schema',
  'fake_table',
  123,
  (select id from cif.project_revision order by id desc limit 1 offset 1),
  'pending',
  'Testing form_change delete propagation'
);


select is(
  (select new_form_data->>'revision' from cif.form_change where form_data_table_name = 'fake_table' and deleted_at is not null),
  null,
  'form_change records are not marked deleted upon creation'
);

update cif.project_revision set deleted_at = now() where id = (select id from cif.project_revision order by id desc limit 1);


select is(
  (select new_form_data->>'revision' from cif.form_change where form_data_table_name = 'fake_table' and deleted_at is not null),
  'one'::text,
  'only the form_change from the deleted revision has been deleted'
);

select finish();

rollback;
