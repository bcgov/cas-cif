begin;

select plan(11);

select has_table('cif', 'emission_intensity_payment_percent', 'table cif.emission_intensity_payment_percent exists');

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

select results_eq (
  $$
    select max_emission_intensity_performance from cif.emission_intensity_payment_percent where max_emission_intensity_performance != 'Infinity'::numeric
  $$,
  $$
    select generate_series::numeric as num from generate_series(30,99)
  $$,
  'cif.emission_intensity_payment_percent contains values from 30-99 inclusive'
);

select col_is_unique(
  'cif',
  'emission_intensity_payment_percent',
  'max_emission_intensity_performance',
  'max_emission_intensity_performance column has unique constraint'
);

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.emission_intensity_payment_percent
  $$,
    'cif_admin can view all data in emission_intensity_payment_percent table'
);

select lives_ok(
  $$
    insert into cif.emission_intensity_payment_percent (max_emission_intensity_performance, payment_percentage)
    values (101, 200);
  $$,
    'cif_admin can insert data in emission_intensity_payment_percent table'
);

select lives_ok(
  $$
    update cif.emission_intensity_payment_percent set payment_percentage=300 where max_emission_intensity_performance=101;
  $$,
    'cif_admin can change data in emission_intensity_payment_percent table'
);

select results_eq(
  $$
    select count(id) from cif.emission_intensity_payment_percent where payment_percentage = 300
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in emission_intensity_payment_percent table'
);


select throws_like(
  $$
    delete from cif.emission_intensity_payment_percent where max_emission_intensity_performance=101
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table emission_intensity_payment_percent'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.emission_intensity_payment_percent
  $$,
  ARRAY[72::bigint],
    'cif_internal can view all data from emission_intensity_payment_percent table'
);

select lives_ok(
  $$
    update cif.emission_intensity_payment_percent set payment_percentage=400 where max_emission_intensity_performance=101;
  $$,
    'cif_internal can update data in the emission_intensity_payment_percent table'
);

select throws_like(
  $$
    delete from cif.emission_intensity_payment_percent where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from emission_intensity_payment_percent table'
);

select finish();

rollback;
