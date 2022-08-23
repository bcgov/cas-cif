begin;

select cif.commit_project_revision(row(project_revision.*)::cif.project_revision) from cif.project_revision;
commit;
