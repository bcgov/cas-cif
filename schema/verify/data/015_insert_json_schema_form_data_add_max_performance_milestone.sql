-- Verify cif:data/015_insert_json_schema_form_data_add_max_performance_milestone on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 12
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
