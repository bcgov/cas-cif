-- Verify cif:data/insert_json_schema_form_data_separate_EP_and_IA_funding_schemas on pg

begin;

do $$
  begin
    assert (
      -- brianna change to 14 when T's PR is in
      (select count(*) from cif.form) = 15
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
