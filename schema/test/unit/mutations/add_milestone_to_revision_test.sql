
begin;

select plan(2);

-- Test Setup
truncate cif.project restart identity cascade;
select cif.create_project();
select cif.add_milestone_to_revision((select id from cif.project_revision order by id desc limit 1), 1);

-- it inserts a new record
select is(
  (select count(*) from cif.form_change
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
  and form_data_table_name in ('reporting_requirement', 'milestone_report', 'payment')),
  3::bigint,
  'There should be form_change records created for reporting_requirement, milestone_report and payment'
);

-- it returns three form_change records, one for each of the reporting_requirement, milestone_report and payment tables.
select set_eq(
  $$
    select project_revision_id, form_data_table_name
    from cif.add_milestone_to_revision((select id from cif.project_revision order by id desc limit 1), 2)
  $$,
  $$
    values (1::bigint, 'reporting_requirement'::varchar), (1::bigint, 'milestone_report'::varchar), (1::bigint, 'payment'::varchar)
  $$,
  'Three newly inserted records should be returned for the correct revision'
);

select finish();


rollback;
