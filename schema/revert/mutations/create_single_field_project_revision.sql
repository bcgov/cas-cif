-- Revert cif:mutations/create_single_field_project_revision from pg

begin;

drop function cif.create_single_field_project_revision;

commit;
