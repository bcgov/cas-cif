-- Deploy cif:mutations/commit_form_change to pg
-- requires: tables/form_change

begin;

create or replace function cif.commit_form_change(row_id int, form_change_patch cif.form_change)
    returns cif.form_change as $$
begin

  update cif.form_change set
    new_form_data = coalesce(form_change_patch.new_form_data, new_form_data),
    validation_errors = coalesce(form_change_patch.validation_errors, validation_errors)
  where id=row_id;

  return (select cif_private.commit_form_change_internal((select row(form_change.*)::cif.form_change from cif.form_change where id = row_id)));
end;
  $$ language plpgsql volatile;

grant execute on function cif.commit_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.commit_form_change is 'Custom mutation to commit a form_change record via the API. Only used for records that are independent of a project such as the lists of contacts and operators.';

commit;
