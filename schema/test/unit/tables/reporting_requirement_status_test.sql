begin;

select plan(12);

select has_table('cif', 'reporting_requirement_status', 'table cif.reporting_requirement_status exists');

select columns_are(
  'cif',
  'reporting_requirement_status',
  ARRAY[
    'status',
    'active',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.reporting_requirement_status match expected columns'
);

select results_eq(
  $$
    select status, active from cif.reporting_requirement_status order by status
  $$,
  $$
    values
      ('completed'::varchar, true),
      ('in_review'::varchar, true),
      ('late'::varchar, true),
      ('on_track'::varchar, true);
  $$,
  'cif.reporting_requirement_status contains the expected values'
);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.reporting_requirement_status
  $$,
    'cif_admin can view all data in reporting_requirement_status table'
);

select lives_ok(
  $$
    insert into cif.reporting_requirement_status (status, active) values ('pending', true);
  $$,
    'cif_admin can insert data in reporting_requirement_status table'
);

select lives_ok(
  $$
    update cif.reporting_requirement_status set active=false where status='pending';
  $$,
    'cif_admin can change data in reporting_requirement_status table'
);

select results_eq(
  $$
    select count(status) from cif.reporting_requirement_status where status= 'pending'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in reporting_requirement_status table'
);

select throws_like(
  $$
    insert into cif.reporting_requirement_status (status, active) values ('completed', true);
  $$,
  'duplicate key value violates unique constraint%',
    'cif_admin cannot insert duplicate data in reporting_requirement_status table'
);

select throws_like(
  $$
    delete from cif.reporting_requirement_status where status='on_track'
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table reporting_requirement_status'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.reporting_requirement_status
  $$,
  ARRAY['5'::bigint],
    'cif_internal can view all data from reporting_requirement_status table'
);

select lives_ok(
  $$
    update cif.reporting_requirement_status set active= false where status='late';
  $$,
    'cif_internal can update data in the reporting_requirement_status table'
);

select throws_like(
  $$
    delete from cif.reporting_requirement_status where status='late';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from reporting_requirement table'
);

select finish();
rollback;
