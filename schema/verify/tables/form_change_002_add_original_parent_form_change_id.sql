-- Verify cif:tables/form_change_002_add_original_parent_form_change_id on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='form_change' and column_name='original_parent_form_change_id'
    ), 'column "original_parent_form_change_id" is defined on table "form_change"';
  end;
$$;

rollback;
