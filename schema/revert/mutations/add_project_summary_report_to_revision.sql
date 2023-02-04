-- Revert cif:mutations/add_project_summary_report_to_revision from pg

BEGIN;

drop function cif.add_project_summary_report_to_revision;

COMMIT;
