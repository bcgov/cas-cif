-- Verify cif:function_set_user_id on pg

begin;

select pg_get_functiondef('cif_private.set_user_id()'::regprocedure);

rollback;
