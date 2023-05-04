-- Verify cif:computed_columns/project_revision_rank on pg

begin;

select cif_private.verify_function_not_present('cif','project_revision_rank',1);

rollback;
