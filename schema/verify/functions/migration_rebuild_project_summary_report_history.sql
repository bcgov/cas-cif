-- Verify cif:migration_rebuild_project_summary_report_history on pg

begin;

select pg_get_functiondef('cif_private.migration_rebuild_project_summary_report_history()'::regprocedure);

rollback;
