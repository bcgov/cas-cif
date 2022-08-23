-- Deploy cif:mutations/commit_project_revision to pg

begin;

create or replace function cif.commit_project_revision(pr cif.project_revision)
returns cif.project_revision as $$
declare
  fc record;
begin
  -- defer FK constraints check to the end of the transaction
  set constraints all deferred;

  if (pr.project_id is not null) and (pr.change_reason is null) then
    raise exception 'Cannot commit revision if change_reason is null.';
  end if;

  -- Propagate the change_status to all related form_change records
  -- Save the project table first do avoid foreign key violations from other potential tables.
  perform cif.commit_form_change(row(form_change.*)::cif.form_change)
  from cif.form_change
  where project_revision_id=pr.id
  and form_data_table_name='project';

  perform cif.commit_form_change(row(form_change.*)::cif.form_change)
  from cif.form_change
  where project_revision_id=pr.id
  and form_data_table_name='reporting_requirement';

  perform cif.commit_form_change(row(form_change.*)::cif.form_change)
  from cif.form_change
  where project_revision_id=pr.id
  and form_data_table_name not in ('project', 'reporting_requirement');

  update cif.project_revision set
    project_id=(select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=pr.id),
    change_status='committed'
  where id=pr.id;

  return (select row(project_revision.*)::cif.project_revision from cif.project_revision where id = pr.id);
end;
$$ language plpgsql;

grant execute on function cif.commit_project_revision to cif_internal, cif_external, cif_admin;

comment on function cif.commit_project_revision(cif.project_revision) is 'Commits a project_revision and all of its form changes';

commit;
