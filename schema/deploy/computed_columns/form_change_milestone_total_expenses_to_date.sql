-- Deploy cif:computed_columns/form_change_milestone_total_expenses_to_date to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_milestone_total_expenses_to_date(fc cif.form_change)
returns numeric
as $$
  with rep_req as (
    select * from cif.form_change rfc
    where rfc.form_data_table_name='reporting_requirement'
    and rfc.project_revision_id = fc.project_revision_id
  ), milestone as (
      select * from cif.form_change mfc
      where mfc.form_data_table_name='milestone_report'
      and mfc.project_revision_id = fc.project_revision_id
    ) select sum((milestone.new_form_data->>'totalEligibleExpenses')::numeric) from milestone
      join rep_req
      on (milestone.new_form_data->>'reportingRequirementId')::int = rep_req.form_data_record_id
      and (rep_req.new_form_data->>'reportDueDate')::timestamptz <= (
        select (r.new_form_data->>'reportDueDate')::timestamptz from cif.form_change r
        where form_data_table_name='reporting_requirement'
        and r.project_revision_id = fc.project_revision_id
        and r.form_data_record_id = ($1.new_form_data->>'reportingRequirementId')::int
      );

$$ language sql stable;

comment on function cif.form_change_milestone_total_expenses_to_date(cif.form_change) is 'Computed columm to return the cumulative total_eligible_expenses to date for a specific milestone. This includes all expenses for milestones with a report_due_date before the calling milestone and the calling milestone expenses';

commit;
