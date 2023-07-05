-- Verify cif:tables/project_status_001_update_harcoded_values on pg

begin;

do $$
  begin
    -- check all new values are present
    assert (
      select 2 = (select count(id)
      from cif.project_status
      where name in ('Emissions Intensity Report Pending', 'Emissions Intensity Report Submission'))
    );
    -- check all old values are gone
    assert (
      select 0 = (select count(id)
      from cif.project_status
      where name = 'Emissions Intensity Report Complete')
    );
  end;
$$;

rollback;
