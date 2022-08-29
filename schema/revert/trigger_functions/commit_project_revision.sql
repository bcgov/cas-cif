-- Deploy cif:trigger_functions/commit_project_revision to pg

begin;

create or replace function cif_private.commit_project_revision()
returns trigger as $$
declare
begin

  if (new.change_status='committed') and (new.project_id is not null) and (new.change_reason is null) then
    raise exception 'Cannot commit change if change_reason is null.';
  end if;

  -- Propagate the change_status to all related form_change records
  -- Save the project table first do avoid foreign key violations from other potential tables.
  update cif.form_change
    set change_status = new.change_status
    where project_revision_id=new.id
    and form_data_table_name='project';

  update cif.form_change
    set change_status = new.change_status
    where project_revision_id=new.id
    and form_data_table_name='reporting_requirement';

  update cif.form_change
    set change_status = new.change_status
    where project_revision_id=new.id
    and form_data_table_name not in ('project', 'reporting_requirement');

  -- If a project_id wasn't created, save it after the form_change row was committed
  if (select triggers_commit from cif.change_status where status=new.change_status) and (new.project_id is null) then
    new.project_id = (
      select form_data_record_id
        from cif.form_change
        where project_revision_id=new.id
          and form_data_table_name='project'
          and form_data_schema_name='cif'
      );
  end if;

  return new;
end;
$$ language plpgsql;


grant execute on function cif_private.commit_project_revision to cif_internal, cif_external, cif_admin;


comment on function cif_private.commit_project_revision()
  is $$
  A trigger that updates the state of all the individual cif.form_change associated to the project_revision.
  It has no effect if the project_revision''s change_status doesn''t have triggers_commit set to true.
  $$;

create trigger commit_project_revision
    before insert or update of change_status on cif.project_revision
    for each row
    execute procedure cif_private.commit_project_revision();

commit;
