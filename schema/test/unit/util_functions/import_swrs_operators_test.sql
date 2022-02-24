begin;
select plan(7);

set client_min_messages to debug;

/**
For this test, some setup was done in schema/data/test_setup/external_database_setup.sql

The data inserted in this file looks like this:

insert into swrs.report(id, swrs_organisation_id, reporting_period_duration)
values
(1, 1, 2019),
(2, 1, 2020),
(3, 2, 2020),
(4, 3, 2020);

insert into swrs.organisation(id, report_id, swrs_organisation_id, business_legal_name, english_trade_name)
values
(1, 1, 1, '2019 legal name 1', '2019 legal name 1'),
(2, 2, 1, '2020 legal name 1', '2020 trade name 1'),
(3, 3, 2, '2020 legal name 2', '2020 trade name 2'),
(4, 4, 3, '2020 legal name 3', '2020 trade name 3');
**/

select cif_private.import_swrs_operators('localhost', 'foreign_test_db', '5432', 'foreign_user', 'foreign_password');

select is(
  (select count(*) from cif.operator),
  3::bigint,
  'Function retrieved the correct number of operators from the foreign database'
);

select isnt_empty(
  $$
    select * from cif.operator where legal_name='2020 legal name 1'
  $$,
  'Function retrieved the latest operator record when there are duplicate operators across reporting yearas'
);

select is_empty(
  $$
    select * from cif.operator where legal_name='2019 legal name 1'
  $$,
  'Function did not retrieve old operator records when there are duplicate operators across reporting yearas'
);

select results_eq(
  $$
    select (new_form_data->'swrs_organisation_id')::int, operation::text, change_reason::text from cif.form_change where form_data_table_name='operator'
  $$,
  $$
    values
      (1, 'create', 'Operator automatically imported from SWRS'),
      (2, 'create', 'Operator automatically imported from SWRS'),
      (3, 'create', 'Operator automatically imported from SWRS')
  $$,
  'The form_change records should reflect the content of the operator table'
);


-- Manually update data & run the import function again
update cif.operator set legal_name='changed by cif', trade_name='changed_by_cif' where swrs_organisation_id = 2;
select cif_private.import_swrs_operators('localhost', 'foreign_test_db', '5432', 'foreign_user', 'foreign_password');


select results_eq(
  $$
    select legal_name, trade_name from cif.operator where swrs_organisation_id = 2
  $$,
  $$
    values ('changed by cif'::varchar, 'changed_by_cif'::varchar)
  $$,
  'Function does not overwrite manually updated records'
);


select * from cif.form_change;

select results_eq(
  $$
    select (new_form_data->'swrs_organisation_id')::int, operation::text, change_reason::text from cif.form_change where form_data_table_name='operator'
  $$,
  $$
    values
      (1, 'create', 'Operator automatically imported from SWRS'),
      (2, 'create', 'Operator automatically imported from SWRS'),
      (3, 'create', 'Operator automatically imported from SWRS'),
      (1, 'update', 'Operator automatically imported from SWRS'),
      (2, 'update', 'Operator automatically imported from SWRS'),
      (3, 'update', 'Operator automatically imported from SWRS')
  $$,
  'A form_change record is added every time an operator is updated by the import script'
);

select is(
  $$
  1
  $$,
  $$
  2
  $$,
  'this test should fail until the operator table is refactored in a separate PR'
);

select finish();

rollback;
