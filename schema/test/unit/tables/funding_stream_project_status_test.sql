begin;

select plan(14);

select has_table('cif', 'funding_stream_project_status', 'table cif.funding_stream_project_status exists');

select columns_are(
  'cif',
  'funding_stream_project_status',
  ARRAY[
    'id',
    'funding_stream_id',
    'project_status_id',
    'sorting_order',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.funding_stream_project_status match expected columns'
);

-- test EP and IA statuses
select results_eq(
  $$
    select count(*) from cif.funding_stream_project_status where project_status_id in (select id from cif.project_status where name in ('Proposal Submitted', 'Under Technical Review', 'Technical Review Complete', 'Waitlisted', 'Disqualified', 'Withdrawn', 'Not Funded', 'Funding Agreement Pending', 'Project in Progress', 'Amendment Pending', 'Agreement Terminated', 'Closed'));
  $$,
  ARRAY['24'::bigint],
    'There are 12 common statuses for each EP and IA funding stream'
);

-- test EP only statuses
select results_eq(
  $$
    select count(*) from cif.funding_stream_project_status where project_status_id in (select id from cif.project_status where name in ('Project in TEIMP', 'Emissions Intensity Report Pending', 'Emissions Intensity Report Submission', 'Project in Annual Reporting'));
  $$,
  ARRAY['4'::bigint],
    'There are 4 EP only statuses'
);

-- test IA only statuses
select results_eq(
  $$
    select count(*) from cif.funding_stream_project_status where project_status_id in (select id from cif.project_status where name in ('Project Summary Report Complete'));
  $$,
  ARRAY['1'::bigint],
    'There is 1 IA only status'
);


-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- need to truncate the table before testing insert/update stuff
truncate cif.funding_stream_project_status restart identity cascade;

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));


select lives_ok(
  $$
    select * from cif.funding_stream_project_status
  $$,
    'cif_admin can view all data in funding_stream_project_status table'
);

select lives_ok(
  $$
    insert into cif.funding_stream_project_status (funding_stream_id, project_status_id, sorting_order) values (1, 1, 1), (2, 2, 2);
  $$,
    'cif_admin can insert data in funding_stream_project_status table'
);

select lives_ok(
  $$
    update cif.funding_stream_project_status set project_status_id = 3 where funding_stream_id = 1 and project_status_id = 1;
  $$,
    'cif_admin can change data in funding_stream_project_status table'
);

select results_eq(
  $$
    select count(project_status_id) from cif.funding_stream_project_status where funding_stream_id = 1 and project_status_id = 3;
  $$,
  ARRAY[1::bigint],
  'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.funding_stream_project_status where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table funding_stream_project_status'
);

--to check unique constraint
select throws_like(
  $$
    insert into cif.funding_stream_project_status (funding_stream_id, project_status_id, sorting_order) values (2, 2, 2);
  $$,
  'duplicate key value violates unique constraint%',
    'cif_admin cannot insert duplicate data in funding_stream_project_status table'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.funding_stream_project_status
  $$,
  ARRAY['2'::bigint],
    'cif_internal can view all data from funding_stream_project_status'
);

select throws_like(
  $$
    update cif.funding_stream_project_status set funding_stream_id = 2 where project_status_id = 3;
  $$,
  'permission denied%',
    'cif_internal cannot update rows from table_funding_stream_project_status'
);

select throws_like(
  $$
    delete from cif.funding_stream_project_status where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_funding_stream_project_status'
);

select finish();

rollback;
