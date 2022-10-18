-- Revert cif:mutations/create_project_revision_001 from pg

begin;

drop function cif.create_project_revision_001;

commit;
