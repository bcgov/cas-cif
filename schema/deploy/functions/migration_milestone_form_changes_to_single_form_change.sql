-- Deploy cif:functions/migration_milestone_form_changes_to_single_form_change to pg

begin;

create or replace function cif_private.migration_milestone_form_changes_to_single_form_change()
returns void as
$migration$



   with milestone_form_changes as (
    select
      reporting_requirement_form_change.id as reporting_requirement_id,
      coalesce(reporting_requirement_form_change.new_form_data, '{}'::jsonb) as reporting_requirement_data,
      payment_form_change.id as payment_id,
      coalesce(payment_form_change.new_form_data, '{}'::jsonb) as payment_data,
      milestone_form_change.id as milestone_id,
      coalesce(milestone_form_change.new_form_data, '{}'::jsonb) as milestone_data
    from cif.form_change as reporting_requirement_form_change
    left join cif.form_change as payment_form_change
      on (payment_form_change.new_form_data->>'reportingRequirementId')::numeric = reporting_requirement_form_change.form_data_record_id
      and (payment_form_change.new_form_data->>'reportingRequirementId')::numeric is not null
    left join cif.form_change as milestone_form_change
      on (milestone_form_change.new_form_data->>'reportingRequirementId')::numeric = reporting_requirement_form_change.form_data_record_id
      and (milestone_form_change.new_form_data->>'reportingRequirementId')::numeric is not null
    where reporting_requirement_form_change.form_data_table_name = 'reporting_requirement'
      and reporting_requirement_form_change.json_schema_name = 'reporting_requirement'
      and reporting_requirement_form_change.new_form_data->>'reportType' in ('General Milestone', 'Advanced Milestone', 'Reporting Milestone')
  ),
  new_data as (
      select
        reporting_requirement_id as id,
        jsonb_strip_nulls(
          jsonb_build_object(
            -- reporting requirement data
            'reportType', reporting_requirement_data->'reportType',
            'reportDueDate', reporting_requirement_data->'reportDueDate',
            'submittedDate', reporting_requirement_data->'submittedDate',
            'comments', reporting_requirement_data->'comments',
            'reportingRequirementIndex', reporting_requirement_data->'reportingRequirementIndex',
            'description', reporting_requirement_data->'description',

            -- has_expenses comes from the report type table
            'hasExpenses', (select has_expenses from cif.report_type where name=(reporting_requirement_data->>'reportType')),

            -- milestone report data
            'substantialCompletionDate', milestone_data->'substantialCompletionDate',
            'certifiedBy', milestone_data->'certifiedBy',
            'certifierProfessionalDesignation', milestone_data->'certifierProfessionalDesignation',
            'maximumAmount', milestone_data->'maximumAmount',
            'totalEligibleExpenses', milestone_data->'totalEligibleExpenses',

            -- payment data
            -- we aren't tracking calculated amounts yet, the migration function doesn't need to take care of them.
            'adjustedGrossAmount', payment_data->'adjustedGrossAmount',
            'adjustedNetAmount', payment_data->'adjustedNetAmount',
            'dateSentToCsnr', payment_data->'dateSentToCsnr'
          )
        ) as new_form_data
      from milestone_form_changes
  ),
  deleted_form_changes as (
    delete from cif.form_change where id in (
      select payment_id as id from milestone_form_changes
      union
      select milestone_id as id from milestone_form_changes
    ) returning *
  )
  update cif.form_change fc
  set
    new_form_data = new_data.new_form_data,
    json_schema_name = 'milestone'
  from new_data
  where fc.id=new_data.id;


$migration$ language sql volatile;

commit;
