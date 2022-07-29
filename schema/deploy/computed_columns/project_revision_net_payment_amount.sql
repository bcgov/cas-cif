-- Deploy cif:computed_columns/project_revision_net_payment_amount to pg

begin;

create or replace function cif.project_revision_net_payment_amount(project_revision cif.project_revision)
returns numeric
as
$computed_column$

  select sum((new_form_data->'adjustedNetAmount')::numeric) from cif.form_change
    where project_revision_id = $1.id
    and form_data_schema_name='cif'
    and form_data_table_name='payment'
    and operation != 'archive';

$computed_column$ language sql stable;

grant execute on function cif.project_revision_net_payment_amount to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_gross_payment_amount is 'Computed column to total the net payments made for a project revision';

commit;
