-- Deploy cif:computed_columns/form_change_net_payments_to_date to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_net_payments_to_date(parameter_fc cif.form_change)
returns numeric as
$fn$

  select
    round(sum(coalesce((fc.new_form_data->>'adjustedNetAmount')::numeric, (fc.new_form_data->>'calculatedNetAmount')::numeric, (fc.new_form_data->>'maximumAmount')::numeric - ((fc.new_form_data->>'maximumAmount')::numeric * (parameter_fc.new_form_data->>'holdbackPercentage')::numeric / 100))), 2)
    from cif.form_change fc
    where fc.project_revision_id = $1.project_revision_id
    and json_schema_name = 'milestone'
    and (fc.new_form_data->>'hasExpenses')::boolean = true;

$fn$ language sql stable;

comment on function cif.form_change_net_payments_to_date(cif.form_change) is 'Computed column returns cumulative sum of all net payments. Preference for value selection is adjustedNetAmount > calculuatedNetAmount > amount calculated via maximum milestone amount';

commit;
