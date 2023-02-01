-- Verify cif:migrations/insert_json_schema_form_data on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 13
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
