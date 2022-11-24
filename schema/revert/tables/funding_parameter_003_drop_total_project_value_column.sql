-- Revert cif:tables/funding_parameter_003_drop_total_project_value_column from pg

begin;

alter table cif.funding_parameter add column total_project_value numeric(20,2);

comment on column cif.funding_parameter.total_project_value is 'Total project value';

commit;
