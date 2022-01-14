-- Deploy cif:tables/project_status to pg

begin;

create table cif.project_status(
  id integer primary key generated always as identity,
  name varchar(1000) not null,
  description varchar(10000)
);

select cif_private.upsert_timestamp_columns('cif', 'project_status');
create unique index project_status_name on cif.project_status(name);

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_status', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_status', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_status', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_status', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_status', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_status', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.project_status is 'Table containing information about possible project statuses';
comment on column cif.project_status.id is 'Unique ID for the project_status';
comment on column cif.project_status.name is 'Name of the project_status';
comment on column cif.project_status.description is 'Description of the project_status';

insert into cif.project_status (name, description) values
('Proposal Submitted', 'Proposal Submitted'),
('Technical Review', 'Technical Review'),
('Review Complete', 'Review Complete'),
('Waitlisted', 'Waitlisted'),
('Disqualified', 'Disqualified'),
('Withdrawn', 'Withdrawn'),
('Funding Offered', 'Funding Offered'),
('Agreement Signed', 'Agreement Signed'),
('Agreement Terminated', 'Agreement Terminated'),
('Advanced Milestone Complete', 'Advanced Milestone Complete'),
('Project Underway', 'Project Underway'),
('TEIMP', 'TEIMP'),
('Performance Milestone Complete', 'Performance Milestone Complete'),
('Summary Report Submitted', 'Summary Report Submitted'),
('Annual Reporting', 'Annual Reporting'),
('Complete', 'Complete'),
('Under Review', 'Under Review');

commit;
