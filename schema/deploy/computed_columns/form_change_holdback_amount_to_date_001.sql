-- Deploy cif:computed_columns/form_change_holdback_amount_to_date_001 to pg


begin;

create or replace function cif.form_change_holdback_amount_to_date(parameter_fc cif.form_change)
returns numeric as
$fn$

  with results as (
    select
        (fc.new_form_data->>'adjustedHoldbackAmount')::numeric as adjustedHoldbackAmount,
        (fc.new_form_data->>'calculatedHoldbackAmount')::numeric as calculatedHoldbackAmount
    from cif.form_change fc
    where fc.project_revision_id = $1.project_revision_id
    and json_schema_name = 'milestone'
    and (fc.new_form_data->>'hasExpenses')::boolean = true
    and fc.operation <> 'archive'
  )

  select
    case
      when count(*) filter (where adjustedHoldbackAmount is null or calculatedHoldbackAmount is null) > 0 then null
      else round(sum(coalesce(adjustedHoldbackAmount, calculatedHoldbackAmount)), 0)
    end
  from results;

$fn$ language sql stable;

comment on function cif.form_change_holdback_amount_to_date(cif.form_change) is 'Computed column returns sum all holdback amounts for a project. If any of the milestones have null values for adjustedHoldbackAmount or calculatedHoldbackAmount, then null is returned. Preference for value selection is adjustedHoldbackAmount > calculatedHoldbackAmount > amount calculated via maximum milestone amount';

commit;
