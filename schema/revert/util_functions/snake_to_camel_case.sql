-- Revert cif:util_functions/snake_to_camel_case from pg

begin;

drop function cif_private.snake_to_camel_case(text);

commit;
