-- Revert cif:funding_stream_project_status_001_update_hardcoded_values from pg

begin;

delete from cif.funding_stream_project_status where project_status_id = (select id from cif.project_status where name = 'Emissions Intensity Report Submission');

update cif.funding_stream_project_status set sorting_order = 15 where project_status_id = (select id from cif.project_status where name = 'Agreement Terminated');
update cif.funding_stream_project_status set sorting_order = 16 where project_status_id = (select id from cif.project_status where name = 'Closed');

commit;
