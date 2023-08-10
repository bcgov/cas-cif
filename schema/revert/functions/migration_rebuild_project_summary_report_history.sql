-- Revert cif:migration_rebuild_project_summary_report_history from pg

begin;

drop function cif_private.migration_rebuild_project_summary_report_history;

commit;
