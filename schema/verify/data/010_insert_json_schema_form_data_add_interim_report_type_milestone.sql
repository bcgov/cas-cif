-- Verify cif:data/insert_json_schema_form_data_add_interim_report_type_milestone on pg


begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 13
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
