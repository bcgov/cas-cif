begin;

select cif.commit_project_revision(id) from cif.project_revision;
commit;
