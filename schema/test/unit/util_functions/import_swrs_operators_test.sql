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
    select
      (new_form_data->'swrsOrganisationId')::int,
      operation::text,
      change_status::text
    from cif.form_change where form_data_table_name='operator' order by id
  $$,
  $$
    values
      (1, 'create', 'committed'),
      (2, 'create', 'committed'),
      (3, 'create', 'committed')
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

select results_eq(
  $$
    select
      (new_form_data->'swrsOrganisationId')::int,
      new_form_data->>'swrsTradeName',
      new_form_data->>'swrsLegalName',
      new_form_data->>'tradeName',
      new_form_data->>'legalName',
      operation::text
    from cif.form_change where form_data_table_name='operator' order by id
  $$,
  $$
    values
      (1, '2020 trade name 1','2020 legal name 1','2020 trade name 1','2020 legal name 1', 'create'),
      (2, '2020 trade name 2','2020 legal name 2','2020 trade name 2','2020 legal name 2', 'create'),
      (3, '2020 trade name 3','2020 legal name 3','2020 trade name 3','2020 legal name 3', 'create')
  $$,
  'A form_change record is only added every time an operator is updated by the import script'
);

-- updating the foreign data, renaming an operator
create server test_swrs_server foreign data wrapper postgres_fdw options (host 'localhost', dbname 'foreign_test_db', port '5432');
create user mapping for current_user server test_swrs_server options (user 'foreign_user', password 'foreign_password');

create foreign table swrs_operator (
  id integer,
  report_id integer,
  swrs_organisation_id integer,
  business_legal_name varchar(1000),
  english_trade_name varchar(1000)
) server test_swrs_server options (schema_name 'swrs', table_name 'organisation');

create foreign table swrs_report (
  id integer,
  swrs_organisation_id integer,
  reporting_period_duration integer
) server test_swrs_server options (schema_name 'swrs', table_name 'report');

insert into swrs_report(id, swrs_organisation_id, reporting_period_duration) values (5,2,2021),(6,3,2021);
insert into swrs_operator(id, report_id, swrs_organisation_id, business_legal_name, english_trade_name)
  values
    (5,5,2,'new legal for operator 2','new trade for operator 2'),
    (6,6,3,'Updated Legal Name','Updated Trade Name');


select cif_private.import_swrs_operators_from_fdw('swrs_operator', 'swrs_report');

drop server test_swrs_server cascade;

select results_eq(
  $$
    select
      (new_form_data->'swrsOrganisationId')::int,
      new_form_data->>'swrsTradeName',
      new_form_data->>'swrsLegalName',
      new_form_data->>'tradeName',
      new_form_data->>'legalName',
      operation::text,
      change_status::text
    from cif.form_change where form_data_table_name='operator'
    order by id
  $$,
  $$
    values
      (1,'2020 trade name 1','2020 legal name 1','2020 trade name 1','2020 legal name 1', 'create', 'committed'),
      (2,'2020 trade name 2','2020 legal name 2','2020 trade name 2','2020 legal name 2', 'create', 'committed'),
      (3,'2020 trade name 3','2020 legal name 3','2020 trade name 3','2020 legal name 3', 'create', 'committed'),
      (2,'new trade for operator 2','new legal for operator 2','changed_by_cif','changed by cif','update','committed'),
      (3,'Updated Trade Name','Updated Legal Name','Updated Trade Name','Updated Legal Name','update','committed')
  $$,
  'legal_name and trade_name are preserved if modified manually, and updated if still set to the SWRS value'
);



select finish();

rollback;
