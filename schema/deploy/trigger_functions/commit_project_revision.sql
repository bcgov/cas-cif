-- Deploy cif:trigger_functions/commit_project_revision to pg

begin;

drop trigger if exists commit_project_revision on cif.project_revision;
drop function if exists cif_private.commit_project_revision();

commit;
