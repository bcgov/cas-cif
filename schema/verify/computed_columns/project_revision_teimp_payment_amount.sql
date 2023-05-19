-- Verify cif:computed_columns/project_revision_teimp_payment_amount on pg

begin;

select cif_private.verify_function_not_present('cif', 'project_revision_teimp_payment_amount', 1);

rollback;
