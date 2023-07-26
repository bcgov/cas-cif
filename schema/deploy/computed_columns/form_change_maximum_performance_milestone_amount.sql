-- Deploy cif:form_change_maximum_performance_milestone_amount to pg

begin;

create or replace function cif.form_change_maximum_performance_milestone_amount(cif.form_change)
returns numeric as
$fn$

select case when exists
    (select
        1
        from cif.form_change fc
        where fc.project_revision_id = $1.project_revision_id
        and json_schema_name = 'milestone'
        and (fc.new_form_data->>'hasExpenses')::boolean = true
        and (fc.new_form_data->>'dateSentToCsnr')::timestamptz is null)
    then null
    else cif.form_change_holdback_amount_to_date($1)
  end;

$fn$ language sql stable;

comment on function cif.form_change_holdback_amount_to_date(cif.form_change) is 'Computed column returns the sum of all holdback amounts for a project IF all milestones have been paid out (ie, all milestones have a value for date sent to CSNR';

commit;
