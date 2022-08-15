-- Deploy cif:computed_columns/project_revision_total_project_value to pg

begin;

create or replace function cif.project_revision_total_project_value(cif.funding_parameter)
returns numeric as
$computed_column$

select $1.max_funding_amount + proponent_cost
-- brianna, blocked on the additional funding ticket



$computed_column$ language sql stable;

comment on function cif.emission_intensity_report_calculated_ei_performance(cif.emission_intensity_report) is 'Returns the calculated EI intensity value';


commit;
