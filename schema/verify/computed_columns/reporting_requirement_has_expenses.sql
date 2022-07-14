-- Verify cif:computed_columns/reporting_requirement_has_expenses on pg

BEGIN;

select pg_get_functiondef('cif.reporting_requirement_has_expenses(cif.reporting_requirement)'::regprocedure);

ROLLBACK;
