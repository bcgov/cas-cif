-- Verify cif:computed_columns/project_revision_total_project_value on pg

begin;

select cif_private.verify_function_not_present('cif','project_revision_total_project_value',1);

rollback;
