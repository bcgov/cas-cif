-- Deploy cif:tables/milestone_report to pg
-- requires: tables/reporting_requirement

begin;

create table cif.milestone_report(
  id integer primary key generated always as identity,
  reporting_requirement_id integer not null references cif.reporting_requirement(id),
  substantial_completion_date timestamptz,
  certified_by varchar(1000),
  certifier_professional_designation varchar(1000),
  maximum_amount numeric,
  total_eligible_expenses numeric
);

select cif_private.upsert_timestamp_columns('cif', 'milestone_report');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'milestone_report', 'cif_internal');
perform cif_private.grant_permissions('insert', 'milestone_report', 'cif_internal');
perform cif_private.grant_permissions('update', 'milestone_report', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'milestone_report', 'cif_admin');
perform cif_private.grant_permissions('insert', 'milestone_report', 'cif_admin');
perform cif_private.grant_permissions('update', 'milestone_report', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.milestone_report is 'Table containing information about a CIF milestone_report';
comment on column cif.milestone_report.id is 'Unique ID for the milestone_report';
comment on column cif.milestone_report.reporting_requirement_id is 'Foreign key to the reporting_requirement_table';
comment on column cif.milestone_report.substantial_completion_date is $$
  The date where the work should be finished by. It can be automatically calculated based upon the type of milestone or manually overridden.
  Automatic calculations are as follows:
    - 30 days before report due date for general milestones
$$;
comment on column cif.milestone_report.certified_by is 'The name of the person who certified the completion of the milestone';
comment on column cif.milestone_report.certifier_professional_designation is 'The professional designation of the person who certified the completion of the milestone';
comment on column cif.milestone_report.maximum_amount is 'The maximum amount in dollars that can be applied to this milestone';
comment on column cif.milestone_report.total_eligible_expenses is 'The total amount of expenses in dollars applied to this milestone';

commit;
