-- Deploy cif:computed_columns/form_change_calculated_total_payment_amount_to_date from pg

begin;

create or replace function cif.form_change_calculated_total_payment_amount_to_date(cif.form_change)
returns numeric
as
$fn$

select (($1.new_form_data->>'maxFundingAmount')::numeric*.8) +
  coalesce(
    ((select new_form_data->>'projectSummaryReportPayment'
      from cif.form_change
      where project_revision_id = $1.project_revision_id
      and json_schema_name = 'project_summary_report'
      and operation != 'archive'
      order by id desc
      limit 1)::numeric),
    0);

$fn$ language sql stable;

comment on function cif.form_change_calculated_total_payment_amount_to_date(cif.form_change) is 'Computed column to calculate the total payment amount to date for an IA project.';

commit;
