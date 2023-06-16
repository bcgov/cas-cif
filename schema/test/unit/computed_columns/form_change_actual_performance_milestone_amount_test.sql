begin;

select plan(4);

/** SETUP **/

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.form_change(
  id,
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  form_data_record_id,
  project_revision_id,
  change_status,
  json_schema_name
)
overriding system value
values (
    1,
    '{}',
    'create',
    'cif',
    'reporting_requirement',
    null,
    1,
    'pending',
    'emission_intensity'
  );

/** SETUP END **/

-- mock functions / form_change_payment_percentage returns null
create or replace function cif.form_change_holdback_amount_to_date(parameter_fc cif.form_change)
  returns numeric as $$ select 0::numeric; $$ language sql stable;
create or replace function cif.form_change_payment_percentage(fc cif.form_change)
  returns numeric as $$ select null::numeric; $$ language sql stable;

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=1
    ) select * from cif.form_change_actual_performance_milestone_amount((select * from record))
  ),
  null,
  'Should return null if form_change_payment_percentage is null'
);

-- mock functions / form_change_holdback_amount_to_date returns null
create or replace function cif.form_change_holdback_amount_to_date(parameter_fc cif.form_change)
  returns numeric as $$ select null::numeric; $$ language sql stable;
create or replace function cif.form_change_payment_percentage(fc cif.form_change)
  returns numeric as $$ select 10::numeric; $$ language sql stable;

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=1
    ) select * from cif.form_change_actual_performance_milestone_amount((select * from record))
  ),
  null,
  'Should return null if form_change_holdback_amount_to_date is null'
);

-- mock functions / form_change_holdback_amount_to_date returns a value but form_change_payment_percentage returns zero
create or replace function cif.form_change_holdback_amount_to_date(parameter_fc cif.form_change)
  returns numeric as $$ select 75.5::numeric; $$ language sql stable;
create or replace function cif.form_change_payment_percentage(fc cif.form_change)
  returns numeric as $$ select 0::numeric; $$ language sql stable;

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=1
    ) select * from cif.form_change_actual_performance_milestone_amount((select * from record))
  ),
  0::numeric,
  'Should return zero if only form_change_payment_percentage is zero'
);

-- mock function form_change_payment_percentage returns a value
create or replace function cif.form_change_payment_percentage(fc cif.form_change)
  returns numeric as $$ select 10.5::numeric; $$ language sql stable;

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=1
    ) select * from cif.form_change_actual_performance_milestone_amount((select * from record))
  ),
  7.9275,
  'Should return the actual performance milestone amount'
);

select finish();

rollback;
