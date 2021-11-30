begin;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id)
overriding system value
values

  (1, 'first operator legal name', 'first operator trade name', '1234abcd'),

  (2, 'second operator legal name', 'second operator trade name', '5555ffff'),

  (3, 'third operator legal name', 'third operator trade name', '9999zzzz')

on conflict (id) do update set
legal_name = excluded.legal_name,
trade_name = excluded.trade_name,
bc_registry_id = excluded.bc_registry_id;

commit;
