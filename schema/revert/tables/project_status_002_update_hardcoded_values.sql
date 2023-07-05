-- Revert cif:tables/project_status_002_rename_emissions_intensity_report_complete from pg

begin;

update cif.project_status set name = 'Emissions Intensity Report Complete', description = 'Emissions Intensity Report Complete' where name = 'Emissions Intensity Report Pending';

delete from cif.project_status where name = 'Emissions Intensity Report Submission';

commit;
