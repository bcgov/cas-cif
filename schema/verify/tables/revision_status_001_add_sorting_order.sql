-- Verify cif:tables/revision_status_001_add_sorting_order on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='revision_status' and column_name='sorting_order'
    ), 'column "sorting_order" is not defined on table "revision_status"';
  end;
$$;

rollback;
