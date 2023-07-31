-- Revert cif:mutations/discard_project_attachment_form_change from pg


begin;

drop function cif.discard_project_attachment_form_change;

commit;
