-- Revert cif:mutations/commit_project_revision from pg

begin;

drop function cif.commit_project_revision;

commit;
