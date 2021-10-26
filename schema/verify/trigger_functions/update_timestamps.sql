-- Verify cif:function_update_timestamps on pg

begin;

select pg_get_functiondef('cif_private.update_timestamps()'::regprocedure);

rollback;
