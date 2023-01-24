-- Deploy cif:computed_columns/form_change_calculated_ei_performance to pg

begin;

create or replace function cif.form_change_calculated_ei_performance(fc cif.form_change)
returns numeric
as
$fn$

  select
    case
      when (fc.new_form_data->>'baselineEmissionIntensity' is null)
        or (fc.new_form_data->>'targetEmissionIntensity' is null)
        or (fc.new_form_data->>'postProjectEmissionIntensity' is null)
        or (fc.new_form_data->>'baselineEmissionIntensity' = fc.new_form_data->>'targetEmissionIntensity')
        then null
      else
        round(((fc.new_form_data->>'baselineEmissionIntensity')::numeric - (fc.new_form_data->>'postProjectEmissionIntensity')::numeric)/((fc.new_form_data->>'baselineEmissionIntensity')::numeric - (fc.new_form_data->>'targetEmissionIntensity')::numeric)*100,2)
    end

$fn$ language sql stable;

comment on function cif.form_change_calculated_ei_performance(cif.form_change) is 'Returns the calculated EI intensity value';

commit;
