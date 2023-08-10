-- Verify cif:functions/handle_project_summary_report_form_change_commit on pg

begin;

select pg_get_functiondef('cif_private.handle_project_summary_report_form_change_commit(cif.form_change)'::regprocedure);

rollback;
