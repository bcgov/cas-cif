
begin;

select plan(13);

select has_table('cif', 'attachment', 'table cif.attachment exists');

select columns_are(
  'cif',
  'attachment',
  ARRAY[
    'id',
    'file',
    'description',
    'file_name',
    'file_type',
    'file_size',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.attachment match expected columns'
);

select indexes_are('cif', 'attachment', array[
  'attachment_file',
  'attachment_pkey',
  'cif_attachment_archived_by_foreign_key',
  'cif_attachment_created_by_foreign_key',
  'cif_attachment_updated_by_foreign_key'
  ],
'Indexes on cif.attachment table does not match expected indexes');

-- Test setup
truncate cif.attachment restart identity cascade;

insert into cif.attachment (description, file_name, file_type, file_size)
values
  ('description1', 'file_name1', 'file_type1', 100),
  ('description2', 'file_name2', 'file_type2', 100),
  ('description3', 'file_name3', 'file_type3', 100);

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select is(
  (select count(*) from cif.attachment),
  3::bigint,
    'cif_admin can view all data in attachment table'
);

select lives_ok(
  $$
    insert into cif.attachment (description, file_name, file_type, file_size) values ('description4', 'file_name4', 'file_type4', 100);
  $$,
    'cif_admin can insert data in attachment table'
);

select lives_ok(
  $$
    update cif.attachment set archived_at = now() where id=4;
  $$,
    'cif_admin can archive data in attachment table'
);

select results_eq(
  $$
    select count(id) from cif.attachment where id=4 and archived_at is not null
  $$,
    ARRAY[1::bigint],
    'Data was archived by cif_admin'
);

select throws_like(
  $$
    delete from cif.attachment where id=4;
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table attachment'
);

-- -- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.attachment
  $$,
  ARRAY[4::bigint],
    'cif_internal can view all data from attachment table'
);

select lives_ok(
  $$
    insert into cif.attachment (description, file_name, file_type, file_size) values ('description5', 'file_name5', 'file_type5', 100);
  $$,
    'cif_internal can insert data in attachment table'
);

select throws_like(
  $$
    delete from cif.attachment where id=5;
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from attachment table'
);

select lives_ok(
  $$
    update cif.attachment set archived_at = now() where id=5;
  $$,
    'cif_internal can update data in the attachment table'
);

select results_eq(
  $$
    select count(id) from cif.attachment where id=5 and archived_at is not null
  $$,
  ARRAY[1::bigint],
    'Data was archived by cif_internal'
);

select finish();

rollback;
