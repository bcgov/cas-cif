begin;

select plan(4);

create table test_table(
  id int generated always as identity,
  legal_name text,
  trade_name text,
  legal_name_updated_by_cif boolean default false,
  trade_name_updated_by_cif boolean default false
);

create trigger trigger_under_test
before update of legal_name, trade_name
on test_table for each row
execute procedure cif_private.protect_manually_updated_operator_data();

insert into test_table(
  legal_name,
  trade_name,
  legal_name_updated_by_cif,
  trade_name_updated_by_cif
) values ('unchanged legal', 'trade', true, false), ('legal', 'unchanged trade', false, true);

-- Update legal_name
update test_table set legal_name = 'changed by cif' where id=1;
select is(
  (select legal_name from test_table where id=1),
  'unchanged legal',
  'Trigger prevents an update to legal_name if legal_name_updated_by_cif is true'
);

update test_table set trade_name = 'changed by cif' where id=1;
select is(
  (select trade_name from test_table where id=1),
  'changed by cif'::text,
  'Trigger does not prevent an update of trade_name if legal_name_updated_by_cif is true'
);

-- Update trade_name
update test_table set trade_name = 'changed by cif' where id=2;
select is(
  (select trade_name from test_table where id=2),
  'unchanged trade',
  'Trigger prevents an update to trade_name if trade_name_updated_by_cif is true'
);

update test_table set legal_name = 'changed by cif' where id=2;
select is(
  (select legal_name from test_table where id=2),
  'changed by cif'::text,
  'Trigger does not prevent an update of legal_name if trade_name_updated_by_cif is true'
);

select finish();

rollback;
