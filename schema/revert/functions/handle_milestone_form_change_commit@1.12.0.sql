-- Deploy cif:functions/handle_milestone_form_change_commit to pg
-- requires: tables/form_change

begin;

create or replace function cif_private.handle_milestone_form_change_commit(fc cif.form_change)
  returns int as $$
declare
  reporting_requirement_record_id int;
begin

  -- If there is no change in the form data, return the form_change record and do not touch the associated table.
  if (fc.new_form_data = '{}') then
    return fc.form_data_record_id; -- can be null if creating with empty form data...problem?
  end if;

  if (fc.change_status = 'committed') then
    raise exception 'Cannot commit form_change. It has already been committed.';
  end if;

  reporting_requirement_record_id := fc.form_data_record_id;

  if fc.operation = 'create' then

    insert into cif.reporting_requirement(
      project_id,
      report_type,
      report_due_date,
      submitted_date,
      comments,
      reporting_requirement_index,
      description
    ) values (
      (select form_data_record_id from cif.form_change pfc where form_data_table_name = 'project' and pfc.project_revision_id = fc.project_revision_id),
      (fc.new_form_data->>'reportType'),
      (fc.new_form_data->>'reportDueDate')::timestamptz,
      (fc.new_form_data->>'submittedDate')::timestamptz,
      (fc.new_form_data->>'comments'),
      (fc.new_form_data->>'reportingRequirementIndex')::int,
      (fc.new_form_data->>'description')
    ) returning id into reporting_requirement_record_id;

    insert into cif.milestone_report(
      reporting_requirement_id,
      substantial_completion_date,
      certified_by,
      certifier_professional_designation,
      maximum_amount,
      total_eligible_expenses
    ) values (
      reporting_requirement_record_id,
      (fc.new_form_data->>'substantialCompletionDate')::timestamptz,
      (fc.new_form_data->>'certifiedBy'),
      (fc.new_form_data->>'certifierProfessionalDesignation'),
      (fc.new_form_data->>'maximumAmount')::numeric,
      (fc.new_form_data->>'totalEligibleExpenses')::numeric
    );

    insert into cif.payment(
      reporting_requirement_id,
      gross_amount,
      net_amount,
      date_sent_to_csnr
    ) values (
      reporting_requirement_record_id,
      coalesce((fc.new_form_data->>'adjustedGrossAmount')::numeric, (fc.new_form_data->>'calculatedGrossAmount')::numeric),
      coalesce((fc.new_form_data->>'adjustedNetAmount')::numeric, (fc.new_form_data->>'calculatedNetAmount')::numeric),
      (fc.new_form_data->>'dateSentToCsnr')::timestamptz
    );

    update cif.form_change set form_data_record_id = reporting_requirement_record_id where id = fc.id;

  elsif fc.operation = 'update' then

    update cif.reporting_requirement rr set
      report_type = (fc.new_form_data->>'reportType'),
      report_due_date = (fc.new_form_data->>'reportDueDate')::timestamptz,
      submitted_date = (fc.new_form_data->>'submittedDate')::timestamptz,
      comments = (fc.new_form_data->>'comments'),
      reporting_requirement_index = (fc.new_form_data->>'reportingRequirementIndex')::int,
      description = (fc.new_form_data->>'description')
    where rr.id = fc.form_data_record_id;

    update cif.milestone_report mr set
      substantial_completion_date = (fc.new_form_data->>'substantialCompletionDate')::timestamptz,
      certified_by = (fc.new_form_data->>'certifiedBy'),
      certifier_professional_designation = (fc.new_form_data->>'certifierProfessionalDesignation'),
      maximum_amount = (fc.new_form_data->>'maximumAmount')::numeric,
      total_eligible_expenses = (fc.new_form_data->>'totalEligibleExpenses')::numeric
    where mr.reporting_requirement_id = fc.form_data_record_id;


    update cif.payment py set
      gross_amount = coalesce((fc.new_form_data->>'adjustedGrossAmount')::numeric, (fc.new_form_data->>'calculatedGrossAmount')::numeric),
      net_amount = coalesce((fc.new_form_data->>'adjustedNetAmount')::numeric, (fc.new_form_data->>'calculatedNetAmount')::numeric),
      date_sent_to_csnr = (fc.new_form_data->>'dateSentToCsnr')::timestamptz
    where py.reporting_requirement_id = fc.form_data_record_id;

  elsif fc.operation = 'archive' then

    update cif.reporting_requirement set archived_at = now() where id = fc.form_data_record_id;
    update cif.milestone_report set archived_at = now() where reporting_requirement_id = fc.form_data_record_id;
    update cif.payment set archived_at = now() where reporting_requirement_id = fc.form_data_record_id;

  end if;

  return reporting_requirement_record_id;
end;
$$ language plpgsql volatile;

grant execute on function cif_private.handle_milestone_form_change_commit to cif_internal, cif_external, cif_admin;

comment on function cif_private.handle_milestone_form_change_commit
  is $$
    The custom function used to parse milestone form_change data into table data.
    The data within the single form_change record is parsed into the reporting_requirement, milestone_report and payment tables.
  $$;

commit;
