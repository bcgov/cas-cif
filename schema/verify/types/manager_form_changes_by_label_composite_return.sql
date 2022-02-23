-- Verify cif:types/manager_form_changes_by_label_composite_return on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'manager_form_changes_by_label_composite_return'
    ), 'type "manager_form_changes_by_label_composite_return" is not defined';
  end;
$$;

rollback;
