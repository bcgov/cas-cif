-- Verify cif:data/006_insert_json_schema_form_data_refactor_funding_schema on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 11
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
