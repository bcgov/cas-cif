-- Verify cif:migrations/008_replace_bad_field_capitalization on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where json_schema_name='milestone'
        and (new_form_data->>'adjustedHoldBackAmount') is not null
      );
    end;
  $$;

rollback;
