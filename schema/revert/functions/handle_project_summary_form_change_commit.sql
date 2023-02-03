-- Revert cif:functions/handle_project_summary_form_change_commit from pg

BEGIN;begin;

drop function cif_private.handle_project_summary_form_change_commit;

commit;
