-- Deploy cif:mutations/stage_form_change to pg

begin;

create or replace function cif.stage_form_change(row_id int, form_change_patch cif.form_change)
returns cif.form_change
as
$$

  update cif.form_change set
    new_form_data = coalesce(form_change_patch.new_form_data, new_form_data),
    validation_errors = coalesce(form_change_patch.validation_errors, validation_errors),
    change_status = 'staged'
  where id=row_id
  returning *;

$$ language sql volatile;

grant execute on function cif.stage_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.stage_form_change(int, cif.form_change) is 'Custom mutation that stages a form_change record';


commit;
