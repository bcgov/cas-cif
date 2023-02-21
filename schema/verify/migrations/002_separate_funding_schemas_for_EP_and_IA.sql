-- Verify cif:migrations/002_separate_funding_schemas_for_EP_and_IA on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where json_schema_name='funding_parameter'
      ), 'there are no form_changes with a json_schema_name of funding_parameter';
    end;
  $$;


rollback;
