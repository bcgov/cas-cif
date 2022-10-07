-- Deploy cif:functions/migration_milestone_form_changes_to_single_form_change to pg

begin;

create or replace function cif_private.migration_milestone_form_changes_to_single_form_change()
returns void as
$migration$



  with milestone_form_changes as (
    select
      reporting_requirement_form_change.id,
      coalesce(reporting_requirement_form_change.new_form_data, '{}'::jsonb) as reporting_requirement_data,
      payment_form_change.id,
      coalesce(payment_form_change.new_form_data, '{}'::jsonb) as payment_data,
      milestone_form_change.id,
      coalesce(milestone_form_change.new_form_data, '{}'::jsonb) as milestone_data
    from cif.form_change as reporting_requirement_form_change
      where form_data_table_name = 'reporting_requirement'
      and json_schema_name = 'reporting_requirement'
      and new_form_data->>'reportType' in ('General Milestone', 'Advanced Milestone', 'Reporting Milestone')
    left join cif.form_change as payment_form_change
      on payment_form_change.new_form_data->>'reportingRequirementId'::numeric = reporting_requirement_form_change.form_data_record_id
      and payment_form_change.new_form_data->>'reportingRequirementId'::numeric is not null
    left join cif.form_change as milestone_form_change
      on milestone_form_change.new_form_data->>'reportingRequirementId'::numeric = reporting_requirement_form_change.form_data_record_id
      and milestone_form_change.new_form_data->>'reportingRequirementId'::numeric is not null
  ),
  new_data as (
      select
        reporting_requirement_form_change.id as id,
        json_strips_null(
          jsonb_build_object(
            'reportingRequirementIndex', reporting_requirement_data->>'reportingRequirementIndex',
            'description', reporting_requirement_data->>'description',
            'reportType', reporting_requirement_data->>'reportType',
            'hasExpenses', (select has_expenses from cif.report_type where name=milestone_data->>'reportType'),
            'reportDueDate', reporting_requirement_data->>'reportDueDate',
            'submittedDate', reporting_requirement_data->>'submittedDate',
            'substantialCompletionDate', milestone_data->>'substantialCompletionDate',
            'certifiedBy', milestone_data->>'certifiedBy',
            'certifierProfessionalDesignation', milestone_data->>'certifierProfessionalDesignation',
            'maximumAmount', milestone_data->>'maximumAmount',
            'totalEligibleExpenses', milestone_data->>'totalEligibleExpenses',
            'calculatedGrossAmount', null
            'calculatedNetAmount', null
            'adjustedGrossAmount', payment_data->>'adjustedGrossAmount',
            'adjustedNetAmount', payment_data->>'adjustedNetAmount',
            'dateSentToCsnr', payment_data->>'dateSentToCsnr'
          )
        ) as new_form_data
      from milestone_form_changes
  ),
  archived_form_changes as (
    update cif.form_change set archived_at = now() where id in (
      select payment_form_change.id as id from milestone_form_changes
      union
      select milestone_form_change.id as id from milestone_form_changes
    ) returning *
  )
  update cif.form_change
  set
    new_form_data = new_data.new_form_data,
    json_schema_name = 'milestone'
  from new_data
  where id=new_data.id





$migration$ language sql volatile;

commit;
