-- Deploy cif:computed_columns/project_revision_teimp_payment_percentage to pg

begin;

create or replace function cif.project_revision_teimp_payment_percentage(project_revision cif.project_revision)
returns numeric
as
$computed_column$

  -- todo: refactor with @BCerki's computed columns when available

  with emission_intensity_data as (
    select
      (new_form_data->>'baselineEmissionIntensity')::numeric as BEI,
      (new_form_data->>'postProjectEmissionIntensity')::numeric as PEI,
      (new_form_data->>'targetEmissionIntensity')::numeric as TEI
    from cif.form_change
      where project_revision_id=$1.id
      and form_data_table_name='emission_intensity_report'
      and operation != 'archive'
  ),
  emission_intensity_performance as (
    select
      case
        when BEI is null
          or PEI is null
          or TEI is null
          or (BEI - TEI) = 0
          then null
        else
          ((BEI - PEI) / (BEI - TEI)) * 100.0
      end from emission_intensity_data
  )
  select min(payment_percentage)
    from cif.emission_intensity_payment_percent
    where max_emission_intensity_performance >= (select * from emission_intensity_performance);

$computed_column$ language sql stable;

grant execute on function cif.project_revision_teimp_payment_percentage to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_teimp_payment_percentage is
$$
    Computed column to return the TEIMP payment percentage, calculated as specified in the schedule G.
    The calculation for determining emission intensity performance uses three metrics and a calculation:
    Metrics:
    - BEI: Baseline Emission Intensity
    - PEI: Post-Project Emission Intensity
    - TEI: Target Emission Intensity
    Calculation:
    - Emission Intensity Payment Percentage = (BEI - PEI) / (BEI - TEI) * 100
$$;

commit;
