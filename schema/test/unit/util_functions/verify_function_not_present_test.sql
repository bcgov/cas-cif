begin;
select plan(2);

create function some_function()
returns boolean
as
$function$
  select true;
$function$
language sql;

select throws_like(
  $$select cif_private.verify_function_not_present('some_function')$$,
  '% exists when it should not',
  'verify_function_not_present throws an exception if the function exists'
);

drop function some_function;
select is(
  (select cif_private.verify_function_not_present('some_function')),
  true,
  'verify_function_not_present returns true if the function does not exist'
);

select finish();

rollback;
