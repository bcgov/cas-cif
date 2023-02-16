-- Deploy cif:mutations/commit_form_change to pg
begin;

create or replace function cif_private.commit_form_change_internal(fc cif.form_change)
    returns cif.form_change as $$
declare
  recordId int;
begin

  if fc.validation_errors != '[]' then
    raise exception 'Cannot commit change with validation errors: %', fc.validation_errors;
  end if;

  if fc.change_status = 'committed' then
    raise exception 'Cannot commit form_change. It has already been committed.';
  end if;

  -- TODO : add a conditional behaviour based on fc.form_id
  execute format(
    'select "cif_private".%I($1)',
    (select form_change_commit_handler from cif.form where slug = fc.json_schema_name)
   ) using fc into recordId;

  update cif.form_change set
    form_data_record_id = recordId,
    change_status = 'committed'
  where id = fc.id;

  -- Update previous_form_change_id for any corresponding form_change records associated with pending proejct revisions on the same project
  update cif.form_change set
    previous_form_change_id = fc.id
    where project_revision_id in 
      (select id from cif.project_revision
        where project_id = (select project_id from cif.project_revision where id = fc.project_revision_id)
        and id != fc.project_revision_id
        and change_status = 'pending')
    and form_data_table_name = fc.form_data_table_name;

  return (select row(form_change.*)::cif.form_change from cif.form_change where id = fc.id);
end;
  $$ language plpgsql volatile;

grant execute on function cif_private.commit_form_change_internal to cif_internal, cif_external, cif_admin;

comment on function cif_private.commit_form_change_internal(cif.form_change) is
  'Commits the form change, calls the corresponding commit handler, and sets the original_form_change_record_id for any pending form changes';

commit;
