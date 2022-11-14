-- Revert cif:mutations/delete_project_revision_and_amendments from pg

begin;

drop function cif.delete_project_revision_and_amendments;

commit;
