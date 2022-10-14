-- Verify cif:computed_columns/project_revision_type_row_number on pg

begin;

select pg_get_functiondef('cif.project_revision_type_row_number(cif.project_revision)'::regprocedure);

rollback;
