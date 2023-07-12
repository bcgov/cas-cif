-- Verify cif:tables/report_type_004 on pg

begin;

do $$
  begin
    assert (
      select true
      from cif.report_type
      where name='Interim Summary Report' and is_milestone=true
    );
  end;
$$;

rollback;
