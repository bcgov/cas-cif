-- Revert cif:mutations/delete_project_revision from pg

begin;

drop function cif.delete_project_revision;

commit;
