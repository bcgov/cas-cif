begin;
select plan(2);

create type some_type as (
    some_column int
);

select throws_like(
  $$select cif_private.verify_type_not_present('some_type')$$,
  '% type exists when it should not',
  'verify_type_not_present throws an exception if the type exists'
);

drop type some_type;
select is(
  (select cif_private.verify_type_not_present('some_type')),
  true,
  'verify_type_not_present returns true if the type does not exist'
);

select finish();

rollback;
