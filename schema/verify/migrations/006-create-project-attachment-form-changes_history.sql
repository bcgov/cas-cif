-- Verify cif:migrations/006-create-project-attachment-form-changes_history on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where form_data_table_name='project_attachment'
        and change_status='pending'
      ), 'There are pending project_attachment form changes.';
    end;
  $$;

rollback;
