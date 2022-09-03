-- Revert cif:tables/funding_parameter_002 from pg

begin;

alter table cif.funding_parameter
  drop column contract_start_date,
  drop column project_assets_life_end_date;

commit;
