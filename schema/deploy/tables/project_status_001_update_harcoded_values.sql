-- Deploy cif:tables/project_status_001_update_harcoded_values to pg
-- requires: tables/project_status

begin;

-- Add new project status values
insert into cif.project_status (name, description) values
('Not Funded', 'Not Funded'),
('Funding Agreement Pending', 'Funding Agreement Pending'),
('Amendment Pending', 'Amendment Pending'),
('Emissions Intensity Report Complete', 'Emissions Intensity Report Complete');

-- Rename project status values
update cif.project_status set name = 'Under Technical Review', description = 'Under Technical Review' where name = 'Technical Review';
update cif.project_status set name = 'Technical Review Complete', description ='Technical Review Complete' where name = 'Review Complete';
update cif.project_status set name = 'Project in Progress', description = 'Project in Progress' where name = 'Project Underway';
update cif.project_status set name = 'Project in TEIMP', description = 'Project in TEIMP' where name = 'TEIMP';
update cif.project_status set name = 'Project Summary Report Complete', description = 'Project Summary Report Complete' where name = 'Summary Report Submitted';
update cif.project_status set name = 'Project in Annual Reporting', description = 'Project in Annual Reporting' where name = 'Annual Reporting';
update cif.project_status set name = 'Closed', description = 'Closed' where name = 'Complete';

-- delete redundant status values
delete from cif.project_status where name in ('Funding Offered', 'Agreement Signed', 'Advanced Milestone Complete', 'Performance Milestone Complete', 'Under Review');

commit;
