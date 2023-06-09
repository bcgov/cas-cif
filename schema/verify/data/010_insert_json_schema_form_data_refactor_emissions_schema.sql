-- Verify cif:data/010_insert_json_schema_form_data_refactor_emissions_schema on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 12
    ), 'The proper number of values were not inserted in the cif.form table';
  end;
$$;

rollback;
