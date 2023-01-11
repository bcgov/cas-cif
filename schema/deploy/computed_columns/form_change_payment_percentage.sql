-- Deploy cif:functions/form_change_payment_percentage to pg
-- requires: tables/form_change
-- 100 – ((-1.5) x GHG Emission Intensity Performance + 145)

begin;

create or replace function cif.form_change_payment_percentage(fc cif.form_change)
returns numeric as
$fn$

  select
    round(100 - ((-1.5) * (fc.new_form_data->>'adjustedEmissionsIntensityPerformance')::numeric + 145), 2);

$fn$ language sql stable;

comment on function cif.form_change_payment_percentage(cif.form_change) is 'Computed column that returns the payment percentage of a performance milestone.';

commit;
