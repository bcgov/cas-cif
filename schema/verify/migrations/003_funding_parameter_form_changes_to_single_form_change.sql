-- Verify cif:migrations/003_funding_parameter_form_changes_to_single_form_change on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where json_schema_name='additional_funding_source'
      ), 'there are no form_changes for additional_funding_source';
    end;
  $$;


rollback;
