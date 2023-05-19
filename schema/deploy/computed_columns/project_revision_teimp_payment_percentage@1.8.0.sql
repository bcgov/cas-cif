-- Deploy cif:computed_columns/project_revision_teimp_payment_percentage to pg

begin;

create or replace function cif.project_revision_teimp_payment_percentage(project_revision cif.project_revision)
returns numeric
as
$computed_column$

  with emission_intensity_report_form_change as (
    select row(form_change.*)::cif.form_change
      from cif.form_change
      where project_revision_id=$1.id
      and form_data_table_name='emission_intensity_report'
      and operation != 'archive'
  ),
  emission_intensity_report as (
    select cif.form_change_as_emission_intensity_report((
      select * from emission_intensity_report_form_change
    )) as eir
  ),
  emission_intensity_performance as (
    select coalesce(
      (select (eir::cif.emission_intensity_report).adjusted_emissions_intensity_performance from emission_intensity_report)::decimal,
      cif.form_change_calculated_ei_performance((
      select * from emission_intensity_report_form_change
    ))
    )
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
