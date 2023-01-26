-- Verify cif:tables/project_status_001_update_harcoded_values on pg

begin;

do $$
  begin
    -- check all new values are present
    assert (
      select 11 = (select count(id)
      from cif.project_status
      where name in ('Not Funded', 'Funding Agreement Pending', 'Amendment Pending', 'Emissions Intensity Report Complete', 'Closed', 'Under Technical Review', 'Technical Review Complete', 'Project in Progress', 'Project in TEIMP', 'Project Summary Report Complete', 'Project in Annual Reporting'))
    );
    -- check all old values are gone
    assert (
      select 0 = (select count(id)
      from cif.project_status
      where name in ('Funding Offered', 'Agreement Signed', 'Advanced Milestone Complete', 'Performance Milestone Complete', 'Complete', 'Under Review', 'Technical Review', 'Review Complete', 'Project Underway', 'TEIMP', 'Summary Report Submitted', 'Annual Reporting'))
    );
  end;
$$;

rollback;
