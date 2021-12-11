-- Revert cif:util_functions/camel_to_snake_case from pg

begin;

drop function cif_private.camel_to_snake_case(text);

commit;
