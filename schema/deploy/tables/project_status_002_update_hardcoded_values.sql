-- Deploy cif:tables/project_status_001_update_harcoded_values to pg
-- requires: tables/project_status

begin;

insert into cif.project_status (name, description) values
('Emissions Intensity Report Submission', 'Emissions Intensity Report Submission');

update cif.project_status set name = 'Emissions Intensity Report Pending', description = 'Emissions Intensity Report Pending' where name = 'Emissions Intensity Report Complete';

commit;
