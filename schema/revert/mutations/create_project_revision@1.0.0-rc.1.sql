-- Revert cif:mutations/create_project_revision from pg

begin;

drop function cif.create_project_revision(integer);

commit;
