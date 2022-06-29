begin;

select plan(2);

insert into cif.contact(id, given_name, family_name, phone, phone_ext, email)
  overriding system value
  values (1, 'John', 'Doe', '+12501234567', null, 'a1@abc.com'), (2, 'Bob', 'Loblaw', '+12501234567', '123', 'a2@abc.com');


select is(
  (
    select cif.contact_full_phone((select row(contact.*)::cif.contact from cif.contact where id=1))
  ),
  '+1 (250) 123-4567',
  'Returns the formatted of the contact without extension'
);

select is(
  (
    select cif.contact_full_phone((select row(contact.*)::cif.contact from cif.contact where id=2))
  ),
  '+1 (250) 123-4567 ext. 123',
  'Returns the formatted of the contact with extension'
);

select finish();
rollback;
