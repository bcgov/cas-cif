-- Deploy cif:mutations/commit_form_change to pg
begin;

create or replace function cif_private.commit_form_change_internal(fc cif.form_change, pending_project_revision_id int)
    returns cif.form_change as $$
declare
  recordId int;
  pending_form_change cif.form_change;
  parent_of_pending_form_change cif.form_change;
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

  if pending_project_revision_id is not null then
    -- If the committing form change is a create, then it needs to be created in the pending revision with an update operation.
    if fc.operation = 'create' then
      perform cif.create_form_change(
        operation => 'update'::cif.form_change_operation,
        form_data_schema_name => 'cif',
        form_data_table_name => fc.form_data_table_name,
        form_data_record_id => fc.form_data_record_id,
        project_revision_id => pending_project_revision_id,
        json_schema_name => fc.json_schema_name,
        new_form_data => fc.new_form_data
      );
    elsif fc.operation = 'update' then
      -- store the other pending project revisions corresponding form_change, and its parent
      select * into pending_form_change from cif.form_change
        where project_revision_id = pending_project_revision_id
        and form_data_table_name = fc.form_data_table_name
        and form_data_record_id = fc.form_data_record_id limit 1;
      select * into parent_of_pending_form_change from cif.form_change
        where id = pending_form_change.previous_form_change_id limit 1;
      -- set the pending form change data to be the committing form change data, plus the changes made in the
      -- pending revision
      update cif.form_change
        set new_form_data =
          (fc.new_form_data || cif.jsonb_minus(pending_form_change.new_form_data, parent_of_pending_form_change.new_form_data))
        where id = pending_form_change.id;

    elsif fc.operation = 'archive' then
      delete from cif.form_change
      where project_revision_id = pending_project_revision_id
        and form_data_table_name = fc.form_data_table_name
        and form_data_record_id = fc.form_data_record_id;
    end if;
  end if;
  return (select row(form_change.*)::cif.form_change from cif.form_change where id = fc.id);
end;
  $$ language plpgsql volatile;

grant execute on function cif_private.commit_form_change_internal(cif.form_change, int) to cif_internal, cif_external, cif_admin;

comment on function cif_private.commit_form_change_internal(cif.form_change, int) is 'Commits the form change and calls the corresponding commit handler.';

commit;
