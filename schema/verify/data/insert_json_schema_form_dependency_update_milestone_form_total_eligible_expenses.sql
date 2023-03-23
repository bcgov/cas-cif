-- Verify cif:data/insert_json_schema_form_dependency_update_milestone_form_total_eligible_expenses on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 14
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

rollback;
