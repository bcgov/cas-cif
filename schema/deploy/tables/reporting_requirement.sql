-- Deploy cif:tables/reporting_requirement to pg


begin;
create table cif.reporting_requirement
(
  id integer primary key generated always as identity,
  report_due_date timestamptz,
  completion_date timestamptz,
  submitted_date timestamptz,
  status varchar(1000) references cif.reporting_requirement_status(status) not null,
  comments varchar(10000),
  certified_by varchar(1000),
  certified_by_professional_designation varchar(1000),
  project_id integer references cif.project(id) not null,
  report_type varchar(1000) references cif.report_type(name) not null,
  reporting_requirement_index integer not null
);

select cif_private.upsert_timestamp_columns('cif', 'reporting_requirement');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'reporting_requirement', 'cif_internal');
perform cif_private.grant_permissions('insert', 'reporting_requirement', 'cif_internal');
perform cif_private.grant_permissions('update', 'reporting_requirement', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'reporting_requirement', 'cif_admin');
perform cif_private.grant_permissions('insert', 'reporting_requirement', 'cif_admin');
perform cif_private.grant_permissions('update', 'reporting_requirement', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;


comment on table cif.reporting_requirement is 'Table containing information about reporting requirements';
comment on column cif.reporting_requirement.id is 'Unique ID for the reporting requirement';
comment on column cif.reporting_requirement.report_due_date is 'The date the reporting requirement is due';
comment on column cif.reporting_requirement.completion_date is 'The date the reporting requirement was completed';
comment on column cif.reporting_requirement.submitted_date is 'The date the reporting requirement was submitted';
comment on column cif.reporting_requirement.status is 'The status of the reporting requirement: on_track, late, completed, in_review';
comment on column cif.reporting_requirement.comments is 'Comments about the reporting requirement';
comment on column cif.reporting_requirement.certified_by is 'The CIF contact who certified the reporting requirement';
comment on column cif.reporting_requirement.project_id is 'Foreign key references the cif.project table';
comment on column cif.reporting_requirement.report_type is 'Foreign key references the cif.report_type table';


commit;
