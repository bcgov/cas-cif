-- Deploy cif:functions/handle_emission_intensity_form_change_commit to pg
-- requires: tables/form_change


begin;

create or replace function cif_private.handle_emission_intensity_form_change_commit(cif.form_change)
  returns int as $$
declare
  reporting_requirement_record_id int;
begin

  -- If there is no change in the form data, return the form_change record and do not touch the associated table.
  if ($1.new_form_data = '{}') then
    return $1.form_data_record_id; -- can be null if creating with empty form data...problem?
  end if;

  if ($1.change_status = 'committed') then
    raise exception 'Cannot commit form_change. It has already been committed.';
  end if;

  reporting_requirement_record_id := $1.form_data_record_id;

  if $1.operation = 'create' then

      insert into cif.reporting_requirement(
      project_id,
      report_type,
      report_due_date,
      submitted_date,
      comments,
      reporting_requirement_index
    ) values (
      (select form_data_record_id from cif.form_change pfc where form_data_table_name = 'project' and pfc.project_revision_id = $1.project_revision_id),
      'TEIMP',
      ($1.new_form_data->>'reportDueDate')::timestamptz,
      ($1.new_form_data->>'submittedDate')::timestamptz,
      ($1.new_form_data->>'comments'),
      1
    ) returning id into reporting_requirement_record_id;

    insert into cif.emission_intensity_report(
        reporting_requirement_id,
        measurement_period_start_date,
        measurement_period_end_date,
        emission_functional_unit,
        production_functional_unit,
        baseline_emission_intensity,
        target_emission_intensity,
        post_project_emission_intensity,
        total_lifetime_emission_reduction,
        adjusted_emissions_intensity_performance,
        adjusted_holdback_payment_amount,
        date_sent_to_csnr
    ) values (
      reporting_requirement_record_id,
      ($1.new_form_data->>'measurementPeriodStartDate')::timestamptz,
      ($1.new_form_data->>'measurementPeriodEndDate')::timestamptz,
      ($1.new_form_data->>'emissionFunctionalUnit')::varchar,
      ($1.new_form_data->>'productionFunctionalUnit')::varchar,
      ($1.new_form_data->>'baselineEmissionIntensity')::numeric,
      ($1.new_form_data->>'targetEmissionIntensity')::numeric,
      ($1.new_form_data->>'postProjectEmissionIntensity')::numeric,
      ($1.new_form_data->>'totalLifetimeEmissionReduction')::numeric,
      ($1.new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric,
      ($1.new_form_data->>'holdbackAmountToDate')::numeric,
      ($1.new_form_data->>'dateSentToCsnr')::timestamptz
    );


    update cif.form_change set form_data_record_id = reporting_requirement_record_id where id = $1.id;

  elsif $1.operation = 'update' then

    update cif.reporting_requirement rr set
      report_type = 'TEIMP',
      report_due_date = ($1.new_form_data->>'reportDueDate')::timestamptz,
      submitted_date = ($1.new_form_data->>'submittedDate')::timestamptz,
      comments = ($1.new_form_data->>'comments')
    where rr.id = $1.form_data_record_id;

    update cif.emission_intensity_report eir set
        measurement_period_start_date = ($1.new_form_data->>'measurementPeriodStartDate')::timestamptz,
        measurement_period_end_date = ($1.new_form_data->>'measurementPeriodEndDate')::timestamptz,
        emission_functional_unit = ($1.new_form_data->>'emissionFunctionalUnit')::varchar,
        production_functional_unit = ($1.new_form_data->>'productionFunctionalUnit')::varchar,
        baseline_emission_intensity = ($1.new_form_data->>'baselineEmissionIntensity')::numeric,
        target_emission_intensity =   ($1.new_form_data->>'targetEmissionIntensity')::numeric,
        post_project_emission_intensity =  ($1.new_form_data->>'postProjectEmissionIntensity')::numeric,
        total_lifetime_emission_reduction =  ($1.new_form_data->>'totalLifetimeEmissionReduction')::numeric,
        adjusted_emissions_intensity_performance =    ($1.new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric,
        adjusted_holdback_payment_amount = ($1.new_form_data->>'holdbackAmountToDate')::numeric,
        date_sent_to_csnr =  ($1.new_form_data->>'dateSentToCsnr')::timestamptz
    where eir.reporting_requirement_id = $1.form_data_record_id;


  elsif $1.operation = 'archive' then

    update cif.reporting_requirement set archived_at = now() where id = $1.form_data_record_id;
    update cif.milestone_report set archived_at = now() where reporting_requirement_id = $1.form_data_record_id;

  end if;

  return reporting_requirement_record_id;
end;
$$ language plpgsql volatile;

grant execute on function cif_private.handle_emission_intensity_form_change_commit to cif_internal, cif_external, cif_admin;

comment on function cif_private.handle_emission_intensity_form_change_commit
  is $$
    The custom function used to parse emission intensity report form_change data into table data.
    The data within the single form_change record is parsed into the reporting_requirement and emission_intensity_report tables.
  $$;

commit;
