-- Verify cif:types/form_change_operation on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'form_change_operation'
    ), 'type "form_change_operation" is not defined';
  end;
$$;

rollback;
