-- Verify cif:types/sum_by_fiscal_year on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'sum_by_fiscal_year'
    ), 'type "sum_by_fiscal_year" is not defined';
  end;
$$;

rollback;
