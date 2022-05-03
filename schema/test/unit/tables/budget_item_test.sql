begin;

select plan(11);

select has_table('cif', 'budget_item', 'table cif.budget_item exists');

select columns_are(
  'cif',
  'budget_item',
  ARRAY[
    'id',
    'amount',
    'category',
    'description',
    'is_confirmed',
    'is_tentative',
    'reporting_requirement_id',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.budget_item match expected columns'
);

-- Test setup
truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;
truncate cif.report_type restart identity cascade;
truncate cif.reporting_requirement restart identity cascade;

insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1');

insert into cif.report_type (name, form_schema) values ('type1', '{}');

insert into cif.reporting_requirement
  (due_date, status, comments, certified_by, certified_by_professional_designation, project_id, report_type_id) values
  ('2020-01-01', 'on_track', 'comment_1', 'certifier_1', 'certifier_1', 1, 1);


insert into cif.budget_item (amount, category, description, is_confirmed, is_tentative, reporting_requirement_id)
values
  (100, 'general', 'description_1', true, false, 1),
  (200, 'general', 'description_2', true, false, 1),
  (300, 'general', 'description_3', true, false, 1);


set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';


-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.budget_item
  $$,
    'cif_admin can view all data in budget_item table'
);

select lives_ok(
  $$
    insert into cif.budget_item (amount, category, description, is_confirmed, is_tentative, reporting_requirement_id)
    values (400, 'general', 'description_4', true, false, 1);
  $$,
    'cif_admin can insert data in budget_item table'
);

select lives_ok(
  $$
    update cif.budget_item set description='description_5' where description='description_4';
  $$,
    'cif_admin can change data in budget_item table'
);

select results_eq(
  $$
    select count(id) from cif.budget_item where description= 'description_5'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in budget_item table'
);

select throws_like(
  $$
    insert into cif.budget_item (amount, category, description, is_confirmed, is_tentative, reporting_requirement_id)
    values (500, 'wrong_category', 'description_6', true, false, 1);
  $$,
  'insert or update on table "budget_item" violates foreign key constraint%',
    'cif_admin cannot insert data in beudget_item table with a category that is not one of the possible categories'
);

select throws_like(
  $$
    delete from cif.budget_item where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table budget_item'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.budget_item
  $$,
  ARRAY[4::bigint],
    'cif_internal can view all data from budget_item table'
);

select lives_ok(
  $$
    update cif.budget_item set description= 'changed_by_internal' where description='description_1';
  $$,
    'cif_internal can update data in the budget_item table'
);

select throws_like(
  $$
    delete from cif.budget_item where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from budget_item table'
);

select finish();

rollback;
