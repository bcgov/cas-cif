-- Verify cif:util_functions/snake_to_camel_case on pg

begin;

select pg_get_functiondef('cif_private.snake_to_camel_case(text)'::regprocedure);

rollback;
