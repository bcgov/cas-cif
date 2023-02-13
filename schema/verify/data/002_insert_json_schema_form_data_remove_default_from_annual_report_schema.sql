-- Verify cif:data/002_insert_json_schema_form_data_remove_default_from_annual_report_schema on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 12
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
