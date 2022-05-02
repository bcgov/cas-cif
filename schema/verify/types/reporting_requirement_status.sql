-- Verify cif:types/reporting_requirement_status on pg


begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'reporting_requirement_status'
    ), 'type "reporting_requirement_status" is not defined';
  end;
$$;

rollback;
