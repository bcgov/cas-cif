-- Revert cif:tables/project_status_001_update_harcoded_values from pg

begin;

-- Add existing project status values
insert into cif.project_status (name, description) values
('Funding Offered', 'Funding Offered'),
('Agreement Signed', 'Agreement Signed'),
('Advanced Milestone Complete', 'Advanced Milestone Complete'),
('Performance Milestone Complete', 'Performance Milestone Complete'),
('Under Review', 'Under Review');


-- Rename project status values back to previous values
update cif.project_status set name = 'Technical Review', description = 'Technical Review' where name = 'Under Technical Review';
update cif.project_status set name = 'Review Complete', description ='Review Complete' where name = 'Technical Review Complete';
update cif.project_status set name = 'Project Underway', description = 'Project Underway' where name = 'Project in Progress';
update cif.project_status set name = 'TEIMP', description = 'TEIMP' where name = 'Project in TEIMP';
update cif.project_status set name = 'Summary Report Submitted', description = 'Summary Report Submitted' where name = 'Project Summary Report Complete';
update cif.project_status set name = 'Annual Reporting', description = 'Annual Reporting' where name = 'Project in Annual Reporting';
update cif.project_status set name = 'Complete', description = 'Complete' where name = 'Closed';

-- delete new status values
delete from cif.project_status where name in ('Not Funded', 'Funding Agreement Pending', 'Amendment Pending', 'Emissions Intensity Report Complete');

commit;
