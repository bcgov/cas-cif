begin;
select plan(17);

select has_table('cif', 'funding_stream_rfp_project_status_project_status', 'table cif.funding_stream_rfp_project_status exists');
select has_column('cif', 'funding_stream_rfp_project_status', 'id', 'table cif.funding_stream_rfp_project_status has id column');
select has_column('cif', 'funding_stream_rfp_project_status', 'funding_stream_rfp_id', 'table cif.funding_stream_rfp_project_status has funding_stream_rfp_id column');
select has_column('cif', 'funding_stream_rfp_project_status', 'project_status_id', 'table cif.funding_stream_rfp_project_status has project_status_id column');
select has_column('cif', 'funding_stream_rfp_project_status', 'updated_at', 'table cif.funding_stream_rfp_project_status has updated_at column');
select has_column('cif', 'funding_stream_rfp_project_status', 'deleted_at', 'table cif.funding_stream_rfp_project_status has deleted_at column');
select has_column('cif', 'funding_stream_rfp_project_status', 'created_by', 'table cif.funding_stream_rfp_project_status has created_by column');
select has_column('cif', 'funding_stream_rfp_project_status', 'updated_by', 'table cif.funding_stream_rfp_project_status has updated_by column');
select has_column('cif', 'funding_stream_rfp_project_status', 'deleted_by', 'table cif.funding_stream_rfp_project_status has deleted_by column');


-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.funding_stream_rfp_project_status
  $$,
    'cif_admin can view all data in funding_stream_rfp_project_status table'
);

select lives_ok(
  $$
    insert into cif.funding_stream_rfp_project_status (funding_stream_rfp_id, project_status_id) values (1, 1), (1, 2);
  $$,
    'cif_admin can insert data in funding_stream_rfp_project_status table'
);

select lives_ok(
  $$
    update cif.funding_stream_rfp_project_status set project_status_id = 3 where funding_stream_rfp_id = 1 and project_status_id = 2;
  $$,
    'cif_admin can change data in funding_stream_rfp_project_status table'
);

select results_eq(
  $$
    select project_status_id from cif.funding_stream_rfp_project_status where funding_stream_rfp_id = 1 and project_status_id = 3;
  $$,
    3,
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.funding_stream_rfp_project_status where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table funding_stream_rfp_project_status'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.funding_stream_rfp_project_status
  $$,
  ARRAY['2'::bigint],
    'cif_internal can view all data from funding_stream_rfp_project_status'
);

select throws_like(
  $$
    update cif.funding_stream_rfp_project_status set funding_stream_rfp_id = 2 where project_status_id = 3;
  $$,
  'permission denied%',
    'cif_internal cannot update rows from table_funding_stream_rfp_project_status'
);

select throws_like(
  $$
    delete from cif.funding_stream_rfp_project_status where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_funding_stream_rfp_project_status'
);

select finish();
rollback;
