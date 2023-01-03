-- Deploy cif:computed_columns/project_revision_anticipated_funding_amount_by_fiscal_year to pg

begin;

create or replace function cif.project_revision_anticipated_funding_amount_per_fiscal_year(project_revision cif.project_revision)
returns setof cif.sum_by_fiscal_year
as
$computed_column$

with fiscal as (select cif.get_fiscal_year_from_timestamp((select (new_form_data->>'dateSentToCsnr')::timestamptz)) from cif.form_change
    -- where project_revision_id = 1
    where project_revision_id = $1.project_id
    and form_data_schema_name='cif'
    and operation != 'archive'
    and cif.get_fiscal_year_from_timestamp((select (new_form_data->>'dateSentToCsnr')::timestamptz)) is not null)


select sum((new_form_data->'adjustedGrossAmount')::numeric) from cif.form_change
    where project_revision_id = $1.id
    and form_data_schema_name='cif'
    and form_data_table_name='payment'
    and operation != 'archive';
    and cif.get_fiscal_year_from_timestamp((new_form_data->>'dateSentToCsnr')::timestampz) =



form_change_calculated_net_amount_this_milestone(fc cif.form_change)

2023-01-18T23:59:59.999-08:00

'YYYY-MM-DD HH:MI:SS.MS'

    select cif.get_fiscal_year_from_timestamp((select (new_form_data->>'dateSentToCsnr')::timestamptz from cif.form_change
    where project_revision_id = 1
    and form_data_schema_name='cif'
    and operation != 'archive'));

-- select all reporting requirements associated with project

select * from cif.reporting_requirement where project_id=($1.project_id);

-- narrow down by reports with payments

select gross_amount from cif.payment where reporting_requirement_id = any((
    select id from cif.reporting_requirement where project_id=($1.project_id)
));

-- sum payments by year


 payment.reporting_requirement_id
 payment.adjusted_gross_amount
 payment.date_sent_to_csnr

 form_change_calculated_net_amount_this_milestone($1)




$computed_column$ language sql stable;

grant execute on function cif.project_revision_anticipated_funding_amount_per_fiscal_year to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_anticipated_funding_amount_per_fiscal_year is 'Computed column to calculate the anticipated amount of funding for a project by fiscal year';

commit;
