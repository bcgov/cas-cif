-- Deploy cif:computed_columns/form_change_proponents_share_percentage to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_proponents_share_percentage(fc cif.form_change)
returns numeric
as
$fn$

    select case when cif.form_change_total_project_value($1)::numeric is null
    and ($1.new_form_data->>'proponentCost')::numeric is null
        then null
        else
             ($1.new_form_data->>'proponentCost')::numeric / (select cif.form_change_total_project_value($1)) * 100
        end;

$fn$ language sql stable;

comment on function cif.form_change_proponents_share_percentage(cif.form_change) is 'Computed column returns the calculated proponents share percentage.';

commit;
