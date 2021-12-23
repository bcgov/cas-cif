-- Revert cif:functions/pending_new_project_revision from pg


begin;

drop function cif.pending_new_project_revision();

commit;
