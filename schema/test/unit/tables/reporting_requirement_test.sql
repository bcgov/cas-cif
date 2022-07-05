begin;

select plan(10);

select has_table('cif', 'reporting_requirement', 'table cif.reporting_requirement exists');

select columns_are(
  'cif',
  'reporting_requirement',
  ARRAY[
    'id',
    'report_due_date',
    'submitted_date',
    'comments',
    'project_id',
    'report_type',
    'reporting_requirement_index',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by',
    'description'
  ],
  'columns in cif.reporting_requirement match expected columns'
);


-- Test setup
truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;

insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345'),
  ('foo2', 'bar2', '54321'),
  ('foo3', 'bar3', '99999'),
  ('foo4', 'bar4', '00000');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1'),
  (2, 1, 1, '2000-RFP-1-456-ABCD', 'summary', 'project 2'),
  (3, 1, 1, '2000-RFP-1-789-ABCD', 'summary', 'project 3'),
  (4, 1, 1, '2000-RFP-1-1011-ABCD', 'summary', 'project 4');

insert into cif.reporting_requirement
  (report_due_date, comments, project_id, report_type, reporting_requirement_index) values
  ('2020-01-01', 'comment_1', 1, 'Annual',1),
  ('2020-01-02', 'comment_2', 2, 'Annual', 2),
  ('2020-01-03', 'comment_3', 3, 'Annual', 3);


set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.reporting_requirement
  $$,
    'cif_admin can view all data in reporting_requirement table'
);

select lives_ok(
  $$
    insert into cif.reporting_requirement (report_due_date, comment, project_id, report_type, reporting_requirement_index)
    values ('2020-01-04', 'comment_4', 4, 'Annual', 4);
  $$,
    'cif_admin can insert data in reporting_requirement table'
);

select lives_ok(
  $$
    update cif.reporting_requirement set comment='changed by admin' where comment='comment_4';
  $$,
    'cif_admin can change data in reporting_requirement table'
);

select results_eq(
  $$
    select count(id) from cif.reporting_requirement where comment= 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in reporting_requirement table'
);

select throws_like(
  $$
    delete from cif.reporting_requirement where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table reporting_requirement'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.reporting_requirement
  $$,
  ARRAY['4'::bigint],
    'cif_internal can view all data from reporting_requirement table'
);

select lives_ok(
  $$
    update cif.reporting_requirement set comment= 'changed_by_internal' where comment='comment_3';
  $$,
    'cif_internal can update data in the reporting_requirement table'
);

select throws_like(
  $$
    delete from cif.reporting_requirement where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from reporting_requirement table'
);

select finish();

rollback;
