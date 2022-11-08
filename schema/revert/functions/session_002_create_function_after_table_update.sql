-- Revert cif:functions/session_002_create_function_after_table_update from pg

begin;

drop function cif.session();

commit;
