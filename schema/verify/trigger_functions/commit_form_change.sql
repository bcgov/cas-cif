-- Verify cif:trigger_functions/commit_form_changes on pg

begin;

-- TODO use a verify_function_not_present that includes the schema name and parameter types

rollback;
