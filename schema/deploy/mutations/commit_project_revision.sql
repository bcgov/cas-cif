-- Deploy cif:mutations/commit_project_revision to pg

begin;

create or replace function cif.commit_project_revision(revision_to_commit_id int)
returns cif.project_revision as $$
begin
  -- defer FK constraints check to the end of the transaction
  set constraints all deferred;

  if ((select project_id from cif.project_revision where id = $1) is not null)
      and ((select change_reason from cif.project_revision where id = $1) is null) then
    raise exception 'Cannot commit revision if change_reason is null.';
  end if;

  -- Propagate the change_status to all related form_change records
  -- Save the project table first do avoid foreign key violations from other potential tables.
  perform cif.commit_form_change(row(form_change.*)::cif.form_change)
  from cif.form_change
  where project_revision_id=$1
  and form_data_table_name='project';

  perform cif.commit_form_change(row(form_change.*)::cif.form_change)
  from cif.form_change
  where project_revision_id=$1
  and form_data_table_name='reporting_requirement';

  perform cif.commit_form_change(row(form_change.*)::cif.form_change)
  from cif.form_change
  where project_revision_id=$1
  and form_data_table_name not in ('project', 'reporting_requirement');

  update cif.project_revision set
    project_id=(select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=$1),
    change_status='committed'
  where id=$1;

  return (select row(project_revision.*)::cif.project_revision from cif.project_revision where id = $1);
end;
$$ language plpgsql;

grant execute on function cif.commit_project_revision to cif_internal, cif_external, cif_admin;

comment on function cif.commit_project_revision(int) is 'Commits a project_revision and all of its form changes';

commit;
