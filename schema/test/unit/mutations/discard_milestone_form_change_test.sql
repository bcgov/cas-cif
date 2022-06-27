
begin;

select plan(8);

-- Test Setup
truncate cif.project restart identity cascade;
select cif.create_project();
select cif.create_project();
select cif.create_project();
select cif.add_milestone_to_revision(1, 1);
select cif.add_milestone_to_revision(1, 2);
select cif.add_milestone_to_revision(2, 1);

-- Delete tests (where form_change.operation = 'create')
select set_eq(
  $$
    select project_revision_id from cif.discard_milestone_form_change(1,1)
  $$,
  $$
    values (1::int), (1::int), (1::int)
  $$,
  'discard_milestone_form_change returns the deleted rows'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and (
    (form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = 1)
    or
    (form_data_table_name in ('milestone_report', 'payment')
    and project_revision_id=1
    and (new_form_data->>'reportingRequirementId')::int = 1)
  )),
  0::bigint,
  'There should be no form_change records for the deleted reporting_requirement, milestone_report and payment'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and (
    (form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = 2)
    or
    (form_data_table_name in ('milestone_report', 'payment')
    and project_revision_id=1
    and (new_form_data->>'reportingRequirementId')::int = 2)
  )),
  3::bigint,
  'Only the record with the correct reporting_requirement_index and its dependents are deleted'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 2
  and (
    (form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = 1)
    or
    (form_data_table_name in ('milestone_report', 'payment')
    and project_revision_id=2
    and (new_form_data->>'reportingRequirementId')::int = 3)
  )),
  3::bigint,
  'Only the record with the correct project_revision and its dependents are discarded'
);

-- Archive tests (where form_change.operation != 'create')
select cif.add_milestone_to_revision(1, 3);
update cif.form_change set operation = 'update';


select set_eq(
  $$
    select project_revision_id from cif.discard_milestone_form_change(1,2)
  $$,
  $$
    values (1::int), (1::int), (1::int)
  $$,
  'discard_milestone_form_change returns the archived rows'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and (
    (form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = 2)
    or
    (form_data_table_name in ('milestone_report', 'payment')
    and project_revision_id=1
    and (new_form_data->>'reportingRequirementId')::int = 2)
  )
  and operation = 'archive'),
  3::bigint,
  'There should be 3 archived form_change records for reporting_requirement, milestone_report and payment'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and (
    (form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = 3)
    or
    (form_data_table_name in ('milestone_report', 'payment')
    and project_revision_id=1
    and (new_form_data->>'reportingRequirementId')::int = 4)
  )
  and operation != 'archive'),
  3::bigint,
  'Only the record with the correct reporting_requirement_index and its dependents are archived'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 2
  and (
    (form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = 1)
    or
    (form_data_table_name in ('milestone_report', 'payment')
    and project_revision_id=2
    and (new_form_data->>'reportingRequirementId')::int = 3)
  )
  and operation != 'archive'),
  3::bigint,
  'Only the record with the correct project_revision and its dependents are archived'
);

select * from cif.form_change;


select finish();

rollback;
