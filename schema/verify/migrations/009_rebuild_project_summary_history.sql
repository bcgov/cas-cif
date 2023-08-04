-- Verify cif:migrations/009_rebuild_project_summary_history on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where form_data_table_name='project_summary_report'
        and form_data_record_id is not null
      );
    end;
  $$;

rollback;
