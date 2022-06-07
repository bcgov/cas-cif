-- Deploy cif:tables/reporting_requirement to pg


begin;
create table cif.reporting_requirement
(
  id integer primary key generated always as identity,
  report_due_date timestamptz,
  completion_date timestamptz,
  submitted_date timestamptz,
  comments varchar(10000),
  certified_by varchar(1000),
  certified_by_professional_designation varchar(1000),
  project_id integer references cif.project(id) not null,
  report_type varchar(1000) references cif.report_type(name) not null,
  reporting_requirement_index integer not null,
  maximum_amount numeric,
  description varchar(10000)
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
comment on column cif.reporting_requirement.completion_date is
$$The date where the work should be finished by. It can be automatically calculated based upon the type of milestone or manually overridden.
  Automatic calculations are as follows:
  30 days before report due date for general milestones
  60 days before report due date for project summary report
  150 days before report due date for TEIMP report$$;
comment on column cif.reporting_requirement.submitted_date is 'The date the reporting requirement was submitted';
comment on column cif.reporting_requirement.comments is 'Comments about the reporting requirement';
comment on column cif.reporting_requirement.certified_by is 'The name of the person who certified the completion reporting requirement';
comment on column cif.reporting_requirement.certified_by_professional_designation is 'The professional designation of the person who certified the completion of the reporting requirement';
comment on column cif.reporting_requirement.project_id is 'Foreign key references the cif.project table';
comment on column cif.reporting_requirement.report_type is 'Foreign key references the cif.report_type table';
comment on column cif.reporting_requirement.reporting_requirement_index is 'An index that identifies the order of the reporting requirement';
comment on column cif.reporting_requirement.maximum_amount is 'The maximum amount of money assigned to a milestone';
comment on column cif.reporting_requirement.description is 'A user defined description of a milestone';

commit;
