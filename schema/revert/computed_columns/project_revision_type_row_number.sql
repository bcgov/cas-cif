-- Revert cif:computed_columns/project_revision_type_row_number from pg

begin;

drop function cif.project_revision_type_row_number;

commit;
