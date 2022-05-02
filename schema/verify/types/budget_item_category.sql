-- Verify cif:types/budget_item_category on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'budget_item_category'
    ), 'type "budget_item_category" is not defined';
  end;
$$;

rollback;
