-- Verify cif:migrations/007_create_form_changes_for_existing_project_attachments on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where form_data_table_name='project_attachment'
        and new_form_data is null
      );
      assert(
        select count(*) = 0
        from cif.project_attachment
        where project_id not in (
          select (new_form_data->>'projectId')::int from cif.form_change
          where form_data_table_name = 'project_attachment'
          and new_form_data is not null
        )
      );
    end;
  $$;

rollback;
