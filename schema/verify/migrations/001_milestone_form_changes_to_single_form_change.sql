-- Verify cif:migrations/001_milestone_form_changes_to_single_form_change on pg

begin;

  -- If the migration has been applied, there are no form_changes for milestone_report or payment tables that are not archived.


  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where
          (form_data_table_name='milestone_report' or form_data_table_name='payment')
          and archived_at is null
      ), 'there are no form_changes for milestone_report or payment tables that are not archived';
    end;
  $$;


rollback;
