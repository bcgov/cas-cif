-- Deploy cif:tables/funding_parameter_002_add_auto_generating_report_date_columns to pg
-- requires: tables/funding_parameter

begin;

alter table cif.funding_parameter
  add column contract_start_date timestamptz,
  add column project_assets_life_end_date timestamptz;

comment on column cif.funding_parameter.contract_start_date is 'contract start date to support the auto-generation of quarterly and annual reports';
comment on column cif.funding_parameter.project_assets_life_end_date is 'project assets life end date to support the auto-generation of quarterly and annual reports';

commit;
