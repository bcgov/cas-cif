begin;

do $$
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
          'givenName', 'GIVEN-NAME-' || lpad(index::text, 3, '0'),
          'familyName', 'FAM-NAME-' || lpad(index::text, 3, '0'),
          'email', 'example-' || lpad(index::text, 3, '0') || '@example.com',
          'phone', '+14155552671',
          'position', 'Manager',
          'comments', 'lorem ipsum dolor sit amet consectetur adipiscing elit 🚀'
          ),
        'create', 'cif', 'contact', 'committed', 'project_contact');
    end loop;
  end
$$;

commit;
