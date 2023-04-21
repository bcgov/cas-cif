-- Revert cif:computed_columns/project_pending_amendment from pg

begin;

drop function cif.project_pending_amendment;

commit;
