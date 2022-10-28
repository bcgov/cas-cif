begin;

insert into cif.cif_user (session_sub, given_name, family_name, email_address)
values

  ('00000000-0000-0000-0000-000000000000', 'cif_internal', 'Testuser', 'cif_internal@somemail.com'),
  ('00000000-0000-0000-0000-000000000001', 'cif_external', 'Testuser', 'cif_external@somemail.com'),
  ('00000000-0000-0000-0000-000000000002', 'cif_admin', 'Testuser', 'cif_admin@somemail.com'),
  ('00000000-0000-0000-0000-000000000003', 'Leslie', 'Knope', 'leslie.knope@gov.bc.ca'),
  ('00000000-0000-0000-0000-000000000004', 'Ron', 'Swanson', 'ronald.ulysses.swanson@gov.bc.ca'),
  ('00000000-0000-0000-0000-000000000005', 'April', 'Ludgate', 'april.ludgate@gov.bc.ca')
on conflict (session_sub) do update set
session_sub = excluded.session_sub,
given_name = excluded.given_name,
family_name = excluded.family_name,
email_address = excluded.email_address;

commit;
