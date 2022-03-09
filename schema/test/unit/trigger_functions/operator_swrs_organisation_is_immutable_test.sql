
begin;

select plan(3);

select lives_ok(
  $$
    insert into cif.operator(swrs_organisation_id, legal_name) values (9876, 'test');
  $$,
  'Trigger allows inserting a new operator'
);

select lives_ok(
  $$
    update cif.operator set legal_name = 'test2' where legal_name = 'test';
  $$,
  'Trigger allows updating an existing operators other values'
);

select throws_ok(
  $$
    update cif.operator set swrs_organisation_id=123 where legal_name = 'test2';
  $$,
  'The swrs_organisation_id cannot be changed',
  'Trigger throws when updating an existing operators swrs_organisation_id'
);

select finish();

rollback;
