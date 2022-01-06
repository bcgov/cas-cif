

begin;

select plan(4);

-- Testing table with a deleted_at column

create table test_table_with_column(
  test_col text,
  deleted_at timestamptz default null
);

create trigger _1_trigger_under_test before update on test_table_with_column for each row
execute procedure cif_private.deleted_records_are_immutable();

insert into test_table_with_column(test_col, deleted_at) values ('test_active', null), ('test_deleted', '2022-01-01 11:00:00.0-08');

select lives_ok(
  $$
    update test_table_with_column set test_col = 'test_changed_active' where test_col = 'test_active'
  $$,
  'doesnt throw if deleted_at is not set'
);

select is(
  (select count(*) from test_table_with_column where test_col = 'test_changed_active'),
  1::bigint,
  'allows the record to be updated if deleted_at is not set'
);

select throws_ok(
  $$
    update test_table_with_column set test_col = 'test_changed_deleted' where test_col = 'test_deleted'
  $$,
  'Deleted records cannot be modified',
  'throws if deleted_at is set'
);

-- Testing table without deleted_at column

create table test_table_without_column(
  test_col text
);

create trigger _1_trigger_under_test before update on test_table_without_column for each row
execute procedure cif_private.deleted_records_are_immutable();

insert into test_table_without_column(test_col) values ('test_value');

select lives_ok(
  $$
    update test_table_without_column set test_col = 'updated!' where test_col = 'test_value'
  $$,
  'doesnt throw if there is no deleted_at column'
);

rollback;
