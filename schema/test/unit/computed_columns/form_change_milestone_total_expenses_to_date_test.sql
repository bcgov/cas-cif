begin;

select plan(4);

/** SETUP */

truncate cif.project restart identity cascade;

select cif.create_project();
select cif.create_project();

select cif.add_milestone_to_revision(1,1);
select cif.add_milestone_to_revision(1,2);
select cif.add_milestone_to_revision(1,3);
select cif.add_milestone_to_revision(1,4);
select cif.add_milestone_to_revision(2,1);

update cif.form_change set new_form_data = new_form_data || '{"totalEligibleExpenses": 100}'
where form_data_table_name='milestone_report'
and (new_form_data->>'reportingRequirementId')::int = 1;

update cif.form_change set new_form_data = new_form_data || '{"totalEligibleExpenses": 200}'
where form_data_table_name='milestone_report'
and (new_form_data->>'reportingRequirementId')::int = 2;

update cif.form_change set new_form_data = new_form_data || '{"totalEligibleExpenses": 300}'
where form_data_table_name='milestone_report'
and (new_form_data->>'reportingRequirementId')::int = 3;

update cif.form_change set new_form_data = new_form_data || '{"totalEligibleExpenses": 300}', operation = 'archive'
where form_data_table_name='milestone_report'
and (new_form_data->>'reportingRequirementId')::int = 4;

update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2023-01-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and (new_form_data->>'reportingRequirementIndex')::int = 1;

update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2024-01-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and (new_form_data->>'reportingRequirementIndex')::int = 2;

update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2025-01-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and (new_form_data->>'reportingRequirementIndex')::int = 3;

update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2026-01-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and (new_form_data->>'reportingRequirementIndex')::int = 4;

/** END SETUP **/

select is (
  (
    with record as (
      (select row(form_change.*)::cif.form_change
      from cif.form_change
      where form_data_table_name='milestone_report'
      and (new_form_data->>'reportingRequirementId')::int = 1)
    ) select cif.form_change_milestone_total_expenses_to_date((select * from record))
  ),
  100::numeric,
  'Computed column returns the correct expense data for the first milestone ordered by reportDueDate'
);

select is (
  (
    with record as (
      (select row(form_change.*)::cif.form_change
      from cif.form_change
      where form_data_table_name='milestone_report'
      and (new_form_data->>'reportingRequirementId')::int = 2)
    ) select cif.form_change_milestone_total_expenses_to_date((select * from record))
  ),
  300::numeric,
  'Computed column returns the correct cumulative expense data for the second milestone ordered by reportDueDate'
);

select is (
  (
    with record as (
      (select row(form_change.*)::cif.form_change
      from cif.form_change
      where form_data_table_name='milestone_report'
      and (new_form_data->>'reportingRequirementId')::int = 3)
    ) select cif.form_change_milestone_total_expenses_to_date((select * from record))
  ),
  600::numeric,
  'Computed column returns the correct cumulative expense data for the third milestone ordered by reportDueDate'
);

select is (
  (
    with record as (
      (select row(form_change.*)::cif.form_change
      from cif.form_change
      where form_data_table_name='milestone_report'
      and (new_form_data->>'reportingRequirementId')::int = 4)
    ) select cif.form_change_milestone_total_expenses_to_date((select * from record))
  ),
  600::numeric,
  'Computed column ignores archived records when calculating cumulative expense data'
);

select finish();

rollback;
