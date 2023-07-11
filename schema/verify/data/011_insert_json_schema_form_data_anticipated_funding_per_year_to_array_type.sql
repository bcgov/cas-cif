-- Verify cif:data/010_insert_json_schema_form_data_anticipated_funding_per_year_to_array_type on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 12
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
