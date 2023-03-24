-- Verify cif:computed_columns/project_revision_latest_committed_form_changes_for on pg

begin;

select pg_get_functiondef('cif.project_revision_latest_committed_form_changes_for(cif.project_revision,text,text,text)'::regprocedure);

rollback;
