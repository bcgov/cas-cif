-- Deploy cif:funding_stream_project_status_001_update_hardcoded_values to pg
-- requires: tables/project_status
-- requires: tables/funding_stream

begin;

update cif.funding_stream_project_status set sorting_order = 20 where project_status_id = (select id from cif.project_status where name = 'Agreement Terminated');
update cif.funding_stream_project_status set sorting_order = 21 where project_status_id = (select id from cif.project_status where name = 'Closed');

insert into cif.funding_stream_project_status (funding_stream_id, project_status_id, sorting_order)
values
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Emissions Intensity Report Submission'), 15);

commit;
