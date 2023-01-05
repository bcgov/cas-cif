-- Deploy cif:mutations/delete_project_revision to pg
begin;

drop function cif.delete_project_revision;

commit;
