-- Verify cif:data/insert_json_schema_form_data_separate_EP_and_IA_funding_schemas on pg

begin;

do $$
  begin
    assert (
      -- (select count(*) from cif.form) = 15
      (select count(*) from cif.form) = 14
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
