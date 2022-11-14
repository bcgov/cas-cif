begin;

select plan(12);

select has_table('cif', 'project_revision_amendment_type', 'table cif.project_revision_amendment_type exists');

select columns_are(
  'cif',
  'project_revision_amendment_type',
  ARRAY[
    'id',
    'project_revision_id',
    'amendment_type',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.project_revision_amendment_type match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

truncate cif.project restart identity cascade;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1'),
  (2, 1, 1, 1, '001', 'summary', 'project 2');

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'pending', 'reason for change', 1),
  (2, 'pending', 'reason for change', 2);

insert into cif.project_revision_amendment_type(project_revision_id, amendment_type)
values
  (1, 'Schedule'),
  (1, 'Scope'),
  (2, 'Cost');



-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select is(
  (select count(*) from cif.project_revision_amendment_type),
  3::bigint,
    'cif_admin can view all data in project_revision_amendment_type table'
);

select lives_ok(
  $$
    insert into cif.project_revision_amendment_type (project_revision_id, amendment_type) values (2, 'Schedule');
  $$,
    'cif_admin can insert data in project_revision_amendment_type table'
);

select lives_ok(
  $$
    update cif.project_revision_amendment_type set amendment_type='Scope' where project_revision_id=2 and amendment_type='Schedule';
  $$,
    'cif_admin can change data in project_revision_amendment_type table'
);

select results_eq(
  $$
    select count(amendment_type) from cif.project_revision_amendment_type where amendment_type= 'Schedule'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    insert into cif.project_revision_amendment_type (project_revision_id, amendment_type) values (2, 'Cost');
  $$,
  'duplicate key value violates unique constraint%',
    'A project revision can only have one amendment type of each type'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.project_revision_amendment_type
  $$,
  ARRAY[4::bigint],
    'cif_internal can view all data from project_revision_amendment_type table'
);

select lives_ok(
  $$
    insert into cif.project_revision_amendment_type (project_revision_id, amendment_type) values (2, 'Schedule');
  $$,
    'cif_internal can insert data in project_revision_amendment_type table'
);

select lives_ok(
  $$
    update cif.project_revision_amendment_type set amendment_type= 'Cost' where amendment_type='Scope' and project_revision_id=1;
  $$,
    'cif_internal can update data in the project_revision_amendment_type table'
);

select throws_like(
  $$
    insert into cif.project_revision_amendment_type (project_revision_id, amendment_type) values (2, 'Cost');
  $$,
  'duplicate key value violates unique constraint%',
    'A project revision can only have one amendment type of each type'
);

select lives_ok(
  $$
    delete from cif.project_revision_amendment_type where project_revision_id=2;
  $$,
    'cif_internal can delete data in project_revision_amendment_type table'
);

select finish();

rollback;
