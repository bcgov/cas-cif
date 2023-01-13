-- Deploy cif:tables/funding_stream_project_status to pg
-- requires: tables/project_status
-- requires: tables/funding_stream

begin;

create table cif.funding_stream_project_status (
  id integer primary key generated always as identity,
  funding_stream_id int not null references cif.funding_stream(id),
  project_status_id int not null references cif.project_status(id),
  sorting_order integer not null default 0
);

create unique index fs_project_status_fs_id_project_status_id_uindex on cif.funding_stream_project_status(funding_stream_id, project_status_id);

select cif_private.upsert_timestamp_columns('cif', 'funding_stream_project_status');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'funding_stream_project_status', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'funding_stream_project_status', 'cif_admin');
perform cif_private.grant_permissions('insert', 'funding_stream_project_status', 'cif_admin');
perform cif_private.grant_permissions('update', 'funding_stream_project_status', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions
end
$grant$;

comment on table cif.funding_stream_project_status is 'Defines project statuses based on the project funding stream.';
comment on column cif.funding_stream_project_status.id is 'Primary key for funding_stream_project_status table';
comment on column cif.funding_stream_project_status.funding_stream_id is 'The id referencing the funding_stream table';
comment on column cif.funding_stream_project_status.project_status_id is 'The id refrencing the project_status table';
comment on column cif.funding_stream_project_status.sorting_order is 'Defines a way to order the project statuses';

--EP and IA statuses
insert into cif.funding_stream_project_status (funding_stream_id, project_status_id, sorting_order)
values
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Proposal Submitted'), 1),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Under Technical Review'), 2),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Technical Review Complete'), 3),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Waitlisted'), 4),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Disqualified'), 5),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Withdrawn'), 6),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Not Funded'), 7),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Funding Agreement Pending'), 8),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Project in Progress'), 9),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Amendment Pending'), 10),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Agreement Terminated'), 15),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Closed'), 16),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Proposal Submitted'), 1),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Under Technical Review'), 2),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Technical Review Complete'), 3),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Waitlisted'), 4),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Disqualified'), 5),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Withdrawn'), 6),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Not Funded'), 7),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Funding Agreement Pending'), 8),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Project in Progress'), 9),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Amendment Pending'), 10),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Agreement Terminated'), 15),
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Closed'), 16);


--EP Only statuses
insert into cif.funding_stream_project_status (funding_stream_id, project_status_id, sorting_order)
values
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Project in TEIMP'), 11),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Emissions Intensity Report Complete'), 12),
((select id from cif.funding_stream where name = 'EP'), (select id from cif.project_status where name = 'Project in Annual Reporting'), 13);

--IA Only statuses
insert into cif.funding_stream_project_status (funding_stream_id, project_status_id, sorting_order)
values
((select id from cif.funding_stream where name = 'IA'), (select id from cif.project_status where name = 'Project Summary Report Complete'), 14);

commit;
