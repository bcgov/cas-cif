-- Verify cif:data/007_json_form_data_remove_default_undefined_operator on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form) = 14
    ), 'The proper number of values were inserted in the cif.form table';
  end;
$$;

end;
