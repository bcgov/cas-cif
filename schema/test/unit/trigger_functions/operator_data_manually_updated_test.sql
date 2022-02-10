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
execute procedure cif_private.operator_data_manually_updated();

insert into test_table(
  legal_name,
  trade_name,
  legal_name_updated_by_cif,
  trade_name_updated_by_cif
) values ('unchanged legal', 'trade', false, false), ('legal', 'unchanged trade', false, false);

-- Update legal_name
update test_table set legal_name = 'changed by cif' where id=1;
select is(
  (select legal_name_updated_by_cif from test_table where id=1),
  true::boolean,
  'Trigger updates the legal_name_updated_by_cif flag when the legal_name is updated'
);

select is(
  (select trade_name_updated_by_cif from test_table where id=1),
  false::boolean,
  'Trigger does not update the trade_name_updated_by_cif flag when the legal_name is updated'
);

-- Update trade_name
update test_table set trade_name = 'changed by cif' where id=2;
select is(
  (select trade_name_updated_by_cif from test_table where id=2),
  true::boolean,
  'Trigger updates the trade_name_updated_by_cif flag when the trade_name is updated'
);

select is(
  (select legal_name_updated_by_cif from test_table where id=2),
  false::boolean,
  'Trigger does not update the legal_name_updated_by_cif flag when the trade_name is updated'
);

select finish();

rollback;
