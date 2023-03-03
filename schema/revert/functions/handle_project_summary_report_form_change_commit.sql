-- Revert cif:functions/handle_project_summary_report_form_change_commit from pg

begin;

drop function cif_private.handle_project_summary_report_form_change_commit;

commit;
