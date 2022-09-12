-- Revert cif:tables/funding_parameter_002_add_auto_generating_report_date_columns from pg

begin;

alter table cif.funding_parameter
  drop column contract_start_date,
  drop column project_assets_life_end_date;

commit;
