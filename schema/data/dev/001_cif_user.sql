begin;

insert into cif.cif_user (uuid, first_name, last_name, email_address)
values

  ('00000000-0000-0000-0000-000000000000', 'cif_internal', 'Testuser', 'cif_internal@somemail.com'),

  ('00000000-0000-0000-0000-000000000001', 'cif_external', 'Testuser', 'cif_external@somemail.com'),

  ('00000000-0000-0000-0000-000000000002', 'cif_admin', 'Testuser', 'cif_admin@somemail.com')

on conflict (uuid) do update set
uuid = excluded.uuid,
first_name = excluded.first_name,
last_name = excluded.last_name,
email_address = excluded.email_address;

commit;
