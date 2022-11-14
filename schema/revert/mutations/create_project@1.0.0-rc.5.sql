-- Revert cif:mutations/create_project from pg

begin;

drop function cif.create_project;

commit;
