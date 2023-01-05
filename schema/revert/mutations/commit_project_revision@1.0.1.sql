-- Deploy cif:mutations/commit_project_revision to pg

begin;

drop function cif.commit_project_revision;

commit;
