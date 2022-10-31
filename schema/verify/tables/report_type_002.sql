-- Verify cif:tables/report_type_002 on pg

begin;

do $$
  begin
    assert (
      select true
      from cif.report_type
      where name='Performance Milestone' and is_milestone=false
    );
  end;
$$;

rollback;
