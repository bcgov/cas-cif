begin;

select plan(3);

insert into cif.cif_user(id, session_sub, given_name, family_name, email_address)
  overriding system value
  values
    (1, '11111111-1111-1111-1111-111111111111', 'John', 'Doe', 'a1@abc.com'),
    (2, '11111111-1111-1111-1111-111111111112', 'Nofamilyname', null, 'a2@abc.com'),
    (3, '11111111-1111-1111-1111-111111111113', null, 'Nogivenname', 'a3@abc.com');


select is(
  (
    select cif.cif_user_full_name((select row(cif_user.*)::cif.cif_user from cif.cif_user where id=1))
  ),
  'John Doe',
  'Returns the full name of the cif user'
);

select is(
  (
    select cif.cif_user_full_name((select row(cif_user.*)::cif.cif_user from cif.cif_user where id=2))
  ),
  'Nofamilyname',
  'Does not print a space if the cif user has no family name'
);

select is(
  (
    select cif.cif_user_full_name((select row(cif_user.*)::cif.cif_user from cif.cif_user where id=3))
  ),
  'Nogivenname',
  'Does not print a space if the cif user has no given name'
);

select finish();
rollback;
