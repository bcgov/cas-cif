-- Deploy cif:mutations/update_milestone_form_change to pg


begin;

create or replace function cif.update_milestone_form_change(row_id int, form_change_patch cif.form_change)
returns cif.form_change
as
$$

select cif.update_form_change($1, $2);

update cif.form_change set
  new_form_data = new_form_data || jsonb_build_object(
    'calculatedGrossAmount',cif.form_change_calculated_gross_amount_this_milestone((select row(form_change.*)::cif.form_change from cif.form_change where id = row_id)),
    'calculatedNetAmount',cif.form_change_calculated_net_amount_this_milestone((select row(form_change.*)::cif.form_change from cif.form_change where id = row_id)),
    'calculatedHoldbackAmount',cif.form_change_calculated_holdback_amount_this_milestone((select row(form_change.*)::cif.form_change from cif.form_change where id = row_id)))
where id=row_id
  returning *;

$$ language sql volatile;

grant execute on function cif.update_milestone_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.update_milestone_form_change(int, cif.form_change) is 'Custom mutation that updates the milestone form change (adds calculated values to new_form_data)';

commit;
