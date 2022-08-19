begin;

select plan(3);

insert into cif.contact(id, given_name, family_name, email)
  overriding system value
  values (1, 'John', 'Doe', 'a1@abc.com'), (2, 'Nofamilyname', null, 'a2@abc.com'), (3, null, 'Nogivenname', 'a3@abc.com');


select is(
  (
    select cif.contact_full_name((select row(contact.*)::cif.contact from cif.contact where id=1))
  ),
  'John Doe',
  'Returns the full name of the contact'
);

select is(
  (
    select cif.contact_full_name((select row(contact.*)::cif.contact from cif.contact where id=2))
  ),
  'Nofamilyname',
  'Does not print a space after the given name if the contact has no family name'
);

select is(
  (
    select cif.contact_full_name((select row(contact.*)::cif.contact from cif.contact where id=3))
  ),
  'Nogivenname',
  'Does not print a space before the family name if the contact has no given name'
);

select finish();
rollback;
