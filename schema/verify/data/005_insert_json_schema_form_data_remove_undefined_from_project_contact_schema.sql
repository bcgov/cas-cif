-- Verify cif:data/005_insert_json_schema_form_data_remove_undefined_from_project_contact_schema on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 13
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
