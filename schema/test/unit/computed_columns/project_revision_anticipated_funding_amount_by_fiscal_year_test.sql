begin;

select * from no_plan();

/** SETUP */

truncate cif.project restart identity cascade;

select cif.create_project();
select cif.create_project();

select cif.add_milestone_to_revision(1,1);
select cif.add_milestone_to_revision(1,2);
select cif.add_milestone_to_revision(1,3);
select cif.add_milestone_to_revision(1,4);
select cif.add_milestone_to_revision(2,1);

-- reporting_requirement fiscal year 2021/2022
update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2022-02-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and (new_form_data->>'reportingRequirementIndex')::int in (1,3);

-- reporting_requirement fiscal year 2022/2023
update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2023-01-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and (new_form_data->>'reportingRequirementIndex')::int in (2,4);

-- reporting_requirement fiscal year 2024/2025
update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2025-02-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and project_revision_id = 2;

update cif.form_change set new_form_data = new_form_data || '{"maximumAmount": 100}' where form_data_table_name='milestone_report';
delete from cif.form_change where form_data_table_name = 'payment' and (new_form_data->>'reportingRequirementId')::int in (3,4);

-- payment fiscal year 2021/2022
update cif.form_change
set new_form_data = new_form_data || '{"date_sent_to_csnr": "2022-03-01 16:21:42.693489-07", "adjustedNetAmount": 300}'::jsonb
where form_data_table_name='payment'
and (new_form_data->>'reportingRequirementId')::int = 1;
-- payment fiscal year 2022/2023
update cif.form_change
set new_form_data = new_form_data || '{"date_sent_to_csnr": "2022-08-01 16:21:42.693489-07", "adjustedNetAmount": 900}'::jsonb
where form_data_table_name='payment'
and (new_form_data->>'reportingRequirementId')::int = 2;
--payment fiscal year 2024/2025
update cif.form_change
set new_form_data = new_form_data || '{"date_sent_to_csnr": "2025-01-01 16:21:42.693489-07", "adjustedNetAmount": 2000}'::jsonb
where form_data_table_name='payment'
and (new_form_data->>'reportingRequirementId')::int = 5;

/** END SETUP */

select has_function('cif', 'project_revision_anticipated_funding_amount_per_fiscal_year', 'Function should exist');

select is (
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select anticipated_funding_amount from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record))
  ),
  (
    select (new_form_data->>'adjustedNetAmount')::numeric
    from cif.form_change
    where form_data_table_name='payment'
    and (new_form_data->>'reportingRequirementId')::int = 5
  ),
  'Function retrieves budget data from the payment form_change when payment is present'
);

delete from cif.form_change where form_data_table_name='payment' and (new_form_data->>'reportingRequirementId')::int = 5;

select is (
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select anticipated_funding_amount from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record))
  ),
  (
    select (new_form_data->>'maximumAmount')::numeric
    from cif.form_change
    where form_data_table_name='milestone_report'
    and (new_form_data->>'reportingRequirementId')::int = 5
  ),
  'Function retrieves budget data from the milestone_report form_change when there is no payment present'
);

-- add another milestone with no data
select cif.add_milestone_to_revision(2,2);
update cif.form_change
set new_form_data = new_form_data || '{"reportDueDate": "2025-02-01 16:21:42.693489-07"}'::jsonb
where form_data_table_name = 'reporting_requirement'
and project_revision_id = 2;

select lives_ok (
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select anticipated_funding_amount from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record))
  $$,
  'Function does not break when passed null amounts'
);

select results_eq (
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record))
  $$,
  $$
    values ('2021/2022'::text, 400::numeric), ('2022/2023'::text, 1000::numeric)
  $$,
  'Function returns the correct summed amounts for each fiscal year'
);

select finish();

rollback;
