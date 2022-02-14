begin;

insert into cif.operator (swrs_organisation_id, legal_name, trade_name, bc_registry_id, operator_code)
values
  (1000, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD'),
  (1001, 'second operator legal name', 'second operator lorem ipsum dolor sit amet limited', 'BC1234567', 'EFGH'),
  (1002, 'third operator legal name', 'third operator trade name', 'EF3456789', 'IJKL');

commit;
