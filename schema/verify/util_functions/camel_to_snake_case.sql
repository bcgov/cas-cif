-- Verify cif:util_functions/camel_to_snake_case on pg

begin;

select pg_get_functiondef('cif_private.camel_to_snake_case(text)'::regprocedure);

rollback;
