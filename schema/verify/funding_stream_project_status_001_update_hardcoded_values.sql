-- Verify cif:funding_stream_project_status_001_update_hardcoded_values on pg

begin;

do $$
  begin
    -- check all new values are present
    assert (
      select 1 = (select count(funding_stream_id)
      from cif.funding_stream_project_status
      where project_status_id = (select id from cif.project_status where name = 'Emissions Intensity Report Submission'))
    );
  end;
$$;

rollback;
