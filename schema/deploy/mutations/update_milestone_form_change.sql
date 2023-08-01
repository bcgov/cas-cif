-- Deploy cif:mutations/update_milestone_form_change to pg


begin;

create or replace function cif.update_milestone_form_change(row_id int, form_change_patch cif.form_change)
returns cif.form_change
as
$$

select cif.update_form_change($1, $2);

update cif.form_change
set new_form_data = new_form_data - 'totalEligibleExpenses'
where id = $1
  and new_form_data->>'reportType' not in ('General Milestone', 'Interim Summary Report');

update cif.form_change
set new_form_data = case
  -- remove expense related values from new_form_data if report type is not eligible for expenses
  when (new_form_data->>'reportType') in (select name from cif.report_type where has_expenses=false) then
    new_form_data - 'calculatedGrossAmount' - 'calculatedNetAmount' - 'calculatedHoldbackAmount' - 'adjustedGrossAmount' - 'adjustedNetAmount' - 'adjustedHoldbackAmount' - 'dateSentToCsnr' - 'maximumAmount'
  else
    new_form_data || jsonb_build_object(
      'calculatedGrossAmount',cif.form_change_calculated_gross_amount_this_milestone((select row(form_change.*)::cif.form_change from cif.form_change where id = row_id)),
      'calculatedNetAmount',cif.form_change_calculated_net_amount_this_milestone((select row(form_change.*)::cif.form_change from cif.form_change where id = row_id)),
      'calculatedHoldbackAmount',cif.form_change_calculated_holdback_amount_this_milestone((select row(form_change.*)::cif.form_change from cif.form_change where id = row_id)))
end
where id=$1
returning *;

$$ language sql volatile;

grant execute on function cif.update_milestone_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.update_milestone_form_change(int, cif.form_change) is 'Custom mutation that updates the milestone form change (adds calculated values to new_form_data)';

commit;
