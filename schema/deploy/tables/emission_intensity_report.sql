-- Deploy cif:tables/emission_intensity_report to pg
-- requires: tables/reporting_requirement

-- Deploy cif:tables/emission_intensity_report to pg

begin;

create table cif.emission_intensity_report(
  id integer primary key generated always as identity,
  reporting_requirement_id integer references cif.reporting_requirement(id),
  measurement_period_start_date timestamptz not null,
  measurement_period_end_date timestamptz not null,
  emission_functional_unit varchar(100) not null default 'tCO2e',
  production_functional_unit varchar(100) not null,
  baseline_emission_intensity numeric not null,
  target_emission_intensity numeric not null,
  post_project_emission_intensity numeric,
  total_lifetime_emission_reduction numeric,
  adjusted_emissions_intensity_performance numeric
);

select cif_private.upsert_timestamp_columns('cif', 'emission_intensity_report');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'emission_intensity_report', 'cif_internal');
perform cif_private.grant_permissions('insert', 'emission_intensity_report', 'cif_internal');
perform cif_private.grant_permissions('update', 'emission_intensity_report', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'emission_intensity_report', 'cif_admin');
perform cif_private.grant_permissions('insert', 'emission_intensity_report', 'cif_admin');
perform cif_private.grant_permissions('update', 'emission_intensity_report', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.emission_intensity_report is 'Table containing information about a CIF emission_intensity_report';
comment on column cif.emission_intensity_report.id is 'Unique ID for the emission_intensity_report';
comment on column cif.emission_intensity_report.reporting_requirement_id is 'Foreign key to for the reporting_requirement table';
comment on column cif.emission_intensity_report.measurement_period_start_date is 'The date when the measurement period starts for a project';
comment on column cif.emission_intensity_report.measurement_period_end_date is 'The date when the measurement period ends for a project';
comment on column cif.emission_intensity_report.emission_functional_unit is 'The units in which the emissions are measured';
comment on column cif.emission_intensity_report.production_functional_unit is 'The units in which the production item that generates emissions are measured';
comment on column cif.emission_intensity_report.baseline_emission_intensity is 'The baseline emission intensity used as a benchmark for calculating emission intensity performance';
comment on column cif.emission_intensity_report.target_emission_intensity is 'The emission intensity defined as a target after a project has completed, used in calculating emission intensity performance';
comment on column cif.emission_intensity_report.post_project_emission_intensity is 'The actual emission intensity achieved after a project has completed, used in calculating emission intensity performance';
comment on column cif.emission_intensity_report.total_lifetime_emission_reduction is 'The total amount of emission reduction expected from the outcome of this project';
comment on column cif.emission_intensity_report.adjusted_emissions_intensity_performance is 'User defined value corresponding to the calculated emission intensity performance. The calculated value gets manually rounded';

commit;
