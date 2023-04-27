begin;

select plan(14);

select has_table('cif', 'project_attachment', 'table cif.project_attachment exists');

select columns_are(
  'cif',
  'project_attachment',
  ARRAY[
    'id',
    'project_id',
    'attachment_id',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.project_attachment match expected columns'
);

select indexes_are('cif', 'project_attachment', array[
  'project_attachment_project_id_attachment_id_unique_index',
  'project_attachment_pkey',
  'cif_project_attachment_archived_by_foreign_key',
  'cif_project_attachment_created_by_foreign_key',
  'cif_project_attachment_updated_by_foreign_key'
  ],
'Indexes on cif.project_attachment table does not match expected indexes');

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;
truncate cif.attachment restart identity cascade;

-- Just for testing since we are dropping these columns
alter table cif.attachment add column if not exists project_id integer references cif.project(id);
alter table cif.attachment add column if not exists project_status_id integer references cif.project_status(id);

insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1');

insert into cif.attachment (description, file_name, file_type, file_size, project_id)
values
  ('description1', 'file_name1', 'file_type1', 100, 1),
  ('description2', 'file_name2', 'file_type2', 100, 1),
  ('description3', 'file_name3', 'file_type3', 100, 1),
  ('description4', 'file_name4', 'file_type4', 100, 1),
  ('description5', 'file_name5', 'file_type5', 100, 1);

insert into cif.project_attachment (project_id, attachment_id)
values
  (1, 1),
  (1, 2),
  (1, 3);

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select is(
  (select count(*) from cif.project_attachment),
  3::bigint,
    'cif_admin can view all data in project_attachment table'
);

select lives_ok(
  $$
    insert into cif.project_attachment (project_id, attachment_id) values (1, 4);
  $$,
    'cif_admin can insert data in project_attachment table'
);

select lives_ok(
  $$
    update cif.project_attachment set archived_at = now() where project_id=1 and attachment_id=4;
  $$,
    'cif_admin can archive data in project_attachment table'
);

select results_eq(
  $$
    select count(id) from cif.project_attachment where project_id=1 and attachment_id=4 and archived_at is not null;
  $$,
    ARRAY[1::bigint],
    'Data was archived by cif_admin'
);

select throws_like(
  $$
    delete from cif.project_attachment where project_id=1 and attachment_id=4;
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table project_attachment'
);

select throws_like(
  $$
    insert into cif.project_attachment (project_id, attachment_id) values (1, 3);
  $$,
  'duplicate key value violates unique constraint%',
    'Administrator cannot insert duplicate rows into table project_attachment'
);

-- -- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.project_attachment
  $$,
  ARRAY[4::bigint],
    'cif_internal can view all data from project_attachment table'
);

select lives_ok(
  $$
    insert into cif.project_attachment (project_id, attachment_id) values (1, 5);
  $$,
    'cif_internal can insert data in project_attachment table'
);

select throws_like(
  $$
    delete from cif.project_attachment where project_id=1 and attachment_id=5;
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from project_attachment table'
);

select lives_ok(
  $$
    update cif.project_attachment set archived_at = now() where project_id=1 and attachment_id=5;
  $$,
    'cif_internal can update data in the project_attachment table'
);

select results_eq(
  $$
    select count(id) from cif.project_attachment where project_id=1 and attachment_id=5 and archived_at is not null;
  $$,
  ARRAY[1::bigint],
    'Data was archived by cif_internal'
);

select finish();

rollback;
