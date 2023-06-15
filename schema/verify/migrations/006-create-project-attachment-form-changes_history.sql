-- Verify cif:migrations/006-create-project-attachment-form-changes_history on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
          from cif.form_change fc
          join cif.project_revision pr
          on fc.project_revision_id = pr.id
          and form_data_table_name = 'project_attachment'
          and fc.change_status = 'pending'
          and pr.change_status = 'committed'
      );
    end;
  $$;

rollback;
