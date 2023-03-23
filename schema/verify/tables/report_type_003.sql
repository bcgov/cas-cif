-- Verify cif:tables/report_type_003 on pg

begin;

do $$
  begin
    assert (
      select true
      from cif.report_type
      where name='Project Summary Report' and is_milestone=false
    );
  end;
$$;

rollback;
