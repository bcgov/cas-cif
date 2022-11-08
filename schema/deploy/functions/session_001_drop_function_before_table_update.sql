-- Deploy cif:functions/session_001_drop_function_before_table_update to pg
-- requires: functions/session

begin;

drop function cif.session();

commit;
