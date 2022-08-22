-- Deploy cif:mutations/commit_form_change to pg
begin;

create or replace function cif.commit_form_change(fc cif.form_change)
    returns cif.form_change as $$
begin

  if fc.validation_errors != '[]' then
    raise exception 'Cannot commit change with validation errors: %', fc.validation_errors;
  end if;

  -- TODO : add a conditional behaviour based on fc.form_id
  update cif.form_change set
    form_data_record_id = (
      select cif_private.handle_default_form_change_commit(fc)
    ),
    change_status = 'committed'
  where id = fc.id;

  return (select row(form_change.*)::cif.form_change from cif.form_change where id = fc.id);
end;
  $$ language plpgsql volatile;

grant execute on function cif.create_project to cif_internal, cif_external, cif_admin;

comment on function cif.commit_form_change(cif.form_change) is 'Commits the form change and calls the corresponding commit handler';

commit;

