-- Revert cif:mutations/add_project_attachment_to_revision from pg

begin;

drop function cif.add_project_attachment_to_revision;

commit;
