-- Verify cif:data/014_insert_json_schema_form_data_add_default_value_for_optional_fields on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 12
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
