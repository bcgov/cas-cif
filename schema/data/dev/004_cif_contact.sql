begin;


do $$
  begin
    for contact_id in 1..50 loop
      insert into cif.contact(given_name, family_name, email, phone, phone_ext, position,comments) values
      (
        'Bob' || lpad(contact_id::text, 3, '0'),
        'Loblaw' || lpad(contact_id::text, 3, '0'),
        'Bob' || lpad(contact_id::text, 3, '0') || '@example.com',
        '1234567890',
        lpad(contact_id::text, 3, '0'),
        'Plant ' || lpad(contact_id::text, 3, '0') || ' Manager',
        'Bob' || lpad(contact_id::text, 3, '0') || 'Loblaw' || lpad(contact_id::text, 3, '0') || ' is a great guy'
        );
    end loop;
  end
$$;

commit;
