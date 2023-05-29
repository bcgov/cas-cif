-- Revert cif:mutations/add_project_attachment_to_revision from pg

begin;

drop function cif.add_project_attachment_to_revision(project_id int, attachment_id int, revision_id int);

commit;
