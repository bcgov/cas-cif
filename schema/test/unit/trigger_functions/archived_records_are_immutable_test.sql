

begin;

select plan(3);

-- Testing table with a archived_at column

create table test_table_with_column(
  test_col text,
  archived_at timestamptz default null
);

create trigger _1_trigger_under_test before update on test_table_with_column for each row
execute procedure cif_private.archived_records_are_immutable();

insert into test_table_with_column(test_col, archived_at) values ('test_active', null), ('test_deleted', '2022-01-01 11:00:00.0-08');

select lives_ok(
  $$
    update test_table_with_column set test_col = 'test_changed_active' where test_col = 'test_active'
  $$,
  'doesnt throw if archived_at is not set'
);

select is(
  (select count(*) from test_table_with_column where test_col = 'test_changed_active'),
  1::bigint,
  'allows the record to be updated if archived_at is not set'
);

select throws_ok(
  $$
    update test_table_with_column set test_col = 'test_changed_deleted' where test_col = 'test_deleted'
  $$,
  'Deleted records cannot be modified',
  'throws if archived_at is set'
);


rollback;
