-- Deploy cif:emission_intensity_report_calculated_ei_performance to pg
-- requires: tables/emission_intensity_report


begin;

create or replace function cif.emission_intensity_report_calculated_ei_performance(cif.emission_intensity_report)
returns decimal as
$computed_column$

select
    case
      when ($1.baseline_emission_intensity is null)
        or ($1.target_emission_intensity is null)
        or ($1.post_project_emission_intensity is null)
        or ($1.baseline_emission_intensity = $1.target_emission_intensity)
        then null
      else
        round(($1.baseline_emission_intensity - $1.post_project_emission_intensity)/($1.baseline_emission_intensity - $1.target_emission_intensity)*100,2)
    end

$computed_column$ language sql stable;

comment on function cif.emission_intensity_report_calculated_ei_performance(cif.emission_intensity_report) is 'Returns the calculated EI intensity value';


commit;
