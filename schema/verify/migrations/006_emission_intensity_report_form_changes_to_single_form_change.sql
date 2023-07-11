-- Verify cif:migrations/006_emission_intensity_report_form_changes_to_single_form_change on pg

begin;

  -- If the migration has been applied, there are no form_changes for the emission_intensity_report table that are not archived (emission report changes now have form_data_table_name='reporting_requirement').


  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where
          (form_data_table_name='emission_intensity_report')
      ), 'there are no form_changes for the emission_intensity_report table that are not archived';
    end;
  $$;


rollback;
