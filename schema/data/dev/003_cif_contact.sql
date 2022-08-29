begin;

do $$
  declare
    temp_id int;
  begin
    for index in 1..50 loop
      insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        change_status,
        json_schema_name
      )
      values
      (
        json_build_object(
          'givenName', 'Bob' || lpad(index::text, 3, '0'),
          'familyName', 'Loblaw' || lpad(index::text, 3, '0'),
          'email', 'bob.l' || lpad(index::text, 3, '0') || '@example.com',
          'phone', '+14155552671',
          'contactPosition', 'Manager',
          'comments', 'lorem ipsum dolor sit amet consectetur adipiscing elit 🚀'
          ),
        'create', 'cif', 'contact', 'pending', 'project_contact') returning id into temp_id;

      perform cif_private.commit_form_change_internal((select row(form_change.*)::cif.form_change from cif.form_change where id = temp_id));
    end loop;
  end
$$;

commit;
