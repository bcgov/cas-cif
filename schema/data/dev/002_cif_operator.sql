begin;

insert into cif.operator (legal_name, trade_name, bc_registry_id, operator_code)
values
  ('first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD'),
  ('second operator legal name', 'second operator lorem ipsum dolor sit amet limited', 'BC1234567', 'EFGH'),
  ('third operator legal name', 'third operator trade name', 'EF3456789', 'IJKL');

commit;
