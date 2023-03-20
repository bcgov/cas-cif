-- Verify cif:data/006_json_schema_project_manager_form_remove_default on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 13
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
