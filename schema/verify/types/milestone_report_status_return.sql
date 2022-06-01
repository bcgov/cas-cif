-- Verify cif:types/milestone_report_status_return on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'milestone_report_status_return'
    ), 'type "milestone_report_status_return" is not defined';
  end;
$$;

rollback;
