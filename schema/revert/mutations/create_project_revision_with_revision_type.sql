-- Deploy cif:mutations/create_project_revision_with_revision_type to pg

begin;

drop function cif.create_project_revision_with_revision_type;


commit;
