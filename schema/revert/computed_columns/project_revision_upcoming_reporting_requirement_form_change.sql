-- Revert cif:computed_columns/project_revision_upcoming_reporting_requirement_form_change from pg

begin;

drop function cif.project_revision_upcoming_reporting_requirement_form_change;

commit;
