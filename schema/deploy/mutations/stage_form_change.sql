-- Deploy cif:mutations/stage_form_change to pg

begin;

create or replace function cif.stage_form_change(row_id int)
returns cif.form_change
as
$$

  update cif.form_change set change_status='staged' where id = $1 returning *;

$$ language sql volatile;

grant execute on function cif.stage_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.stage_form_change(int) is 'Custom mutation that stages a form_change record';


commit;
