

begin;

select plan(2);

insert into cif.cif_user (uuid, first_name, last_name, email_address)
values ('00000000-0000-0000-0000-000000000000', 'test', 'Testuser', 'test@somemail.com');

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
  change_reason,
  deleted_at,
  deleted_by
) values (
  '{"revision": "one" }',
  'UPDATE',
  'fake_schema',
  'fake_table',
  999,
  (select id from cif.project_revision order by id desc limit 1),
  'pending',
  'Testing form_change delete propagation',
  null,
  null
),
(
  '{"revision": "one - deleted" }',
  'UPDATE',
  'fake_schema',
  'fake_table',
  999,
  (select id from cif.project_revision order by id desc limit 1),
  'pending',
  'Testing form_change delete propagation',
  '2020-01-01 00:00:00-08',
  (select id from cif.cif_user where cif_user.uuid = '00000000-0000-0000-0000-000000000000')
),
(
  '{"revision": "two" }',
  'UPDATE',
  'fake_schema',
  'fake_table',
  123,
  (select id from cif.project_revision order by id desc limit 1 offset 1),
  'pending',
  'Testing form_change delete propagation',
  null,
  null
);

update cif.project_revision set deleted_at = now() where id = (select id from cif.project_revision order by id desc limit 1);

select results_eq(
  $$
    select new_form_data->>'revision' as r
    from cif.form_change
    where form_data_table_name = 'fake_table'
    and deleted_at is not null
    order by r asc
  $$,
  $$
    values ('one'), ('one - deleted')
  $$,
  'only the form_change records from the deleted revision have been deleted'
);

select is(
  (select count(*) from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1) and deleted_at='2020-01-01 00:00:00-08'),
  1::bigint,
  'the delete information of the already deleted form_change records has not been overwritten'
);

select finish();

rollback;
