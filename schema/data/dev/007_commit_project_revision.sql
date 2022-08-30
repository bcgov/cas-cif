begin;

do $$
  begin
    perform cif.commit_project_revision(id) from cif.project_revision;
  end
$$;

commit;
