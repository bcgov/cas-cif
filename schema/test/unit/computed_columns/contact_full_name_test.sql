begin;

select plan(3);

insert into cif.contact(id, given_name, family_name)
  overriding system value
  values (1, 'John', 'Doe'), (2, 'Nofamilyname', null), (3, null, 'Nogivenname');


select is(
  (
    select cif.contact_full_name((select row(contact.*)::cif.contact from cif.contact where id=1))
  ),
  'Doe, John',
  'Returns the full name of the contact'
);

select is(
  (
    select cif.contact_full_name((select row(contact.*)::cif.contact from cif.contact where id=2))
  ),
  'Nofamilyname',
  'Does not print a comma if the contact has no family name'
);

select is(
  (
    select cif.contact_full_name((select row(contact.*)::cif.contact from cif.contact where id=3))
  ),
  'Nogivenname',
  'Does not print a comma if the contact has no given name'
);

select finish();
rollback;
