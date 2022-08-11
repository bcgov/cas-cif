-- Verify cif:types/additional_funding_source_status on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'additional_funding_source_status'
    ), 'type "additional_funding_source_status" is not defined';
  end;
$$;

rollback;
