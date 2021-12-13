-- Deploy cif:util_functions/camel_to_snake_case to pg

begin;

create or replace function cif_private.camel_to_snake_case(text) returns text as $$
  select lower(regexp_replace($1, '([A-Z])', '_\1', 'g'));
$$ language sql immutable;

commit;
