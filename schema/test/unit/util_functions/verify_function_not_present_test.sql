begin;
select plan(4);

create schema test_schema;

create function test_schema.some_function(int)
returns boolean
as
$function$
  select true;
$function$
language sql;

select throws_like(
  $$select cif_private.verify_function_not_present('test_schema', 'some_function', 1)$$,
  '% exists when it should not',
  'verify_function_not_present throws an exception if the function exists'
);

select is(
  (select cif_private.verify_function_not_present('test_schem', 'some_function', 1)),
  true,
  'verify_function_not_present returns true if the function does not exist in the given schema'
);

select is(
  (select cif_private.verify_function_not_present('test_schem', 'some_function', 2)),
  true,
  'verify_function_not_present returns true if a function with a matching number of parameters does not exist'
);

drop function test_schema.some_function;
select is(
  (select cif_private.verify_function_not_present('test_schema', 'some_function', 1)),
  true,
  'verify_function_not_present returns true if the function does not exist'
);

select finish();

rollback;
