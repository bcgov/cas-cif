-- Verify cif:computed_columns/project_revision_teimp_payment_percentage on pg

begin;

select cif_private.verify_function_not_present('cif', 'project_revision_teimp_payment_percentage', 1);

rollback;
