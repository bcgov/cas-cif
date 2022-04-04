begin;
do $$
  begin
    for index in 1..50 loop
      insert into cif.project_revision(project_id, change_status) values
      (
        index,
        'committed'
      );
      insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        change_status,
        json_schema_name,
        project_revision_id
      )
      values
      (
        json_build_object(
          'contactId', index::text,
          'projectId', index::text,
          'contactIndex', '1'
          ),
        'create', 'cif', 'project_contact', 'committed', 'project_contact','1');
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
          'cifUserId', least(index, 6)::text,
          'projectId', index::text,
          'projectManagerLabelId', '1'
          ),
        'create', 'cif', 'project_manager', 'committed', 'project_manager');
    end loop;
  end
$$;


commit;
