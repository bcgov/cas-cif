-- Deploy cif:tables/funding_parameter_003_drop_total_project_value_column to pg
-- requires: tables/funding_parameter

begin;

alter table cif.funding_parameter drop column if exists total_project_value;

commit;
