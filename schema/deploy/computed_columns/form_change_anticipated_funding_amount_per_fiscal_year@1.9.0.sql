-- Deploy cif:computed_columns/form_change_anticipated_funding_amount_per_fiscal_year to pg

begin;

create or replace function cif.form_change_anticipated_funding_amount_per_fiscal_year(cif.form_change)
returns setof cif.sum_by_fiscal_year
as
$computed_column$

with form_changes as (
    select * from cif.form_change
    where project_revision_id = $1.project_revision_id
    and form_data_schema_name='cif'
    and form_data_table_name='reporting_requirement'
    and (new_form_data->>'reportType') in (select name from cif.report_type where has_expenses=true)
    and operation != 'archive'
),

anticipated_funding as (
    select
        cif.get_fiscal_year_from_timestamp((select
            coalesce((new_form_data->>'dateSentToCsnr')::timestamptz, (new_form_data->>'submittedDate')::timestamptz, (new_form_data->>'reportDueDate')::timestamptz))) as year,
        sum(
            coalesce(
                (select new_form_data->'adjustedGrossAmount')::numeric,
                (select cif.form_change_calculated_gross_amount_this_milestone(row(form_changes.*))),
                (new_form_data->>'maximumAmount')::numeric
            )
        ) as anticipatedFundingAmount
    from form_changes
    group by year
)

select year, anticipatedFundingAmount from anticipated_funding;

$computed_column$ language sql stable;

grant execute on function cif.form_change_anticipated_funding_amount_per_fiscal_year to cif_internal, cif_external, cif_admin;

comment on function cif.form_change_anticipated_funding_amount_per_fiscal_year is 'Computed column to calculate the anticipated amount of funding for a project by fiscal year';

commit;
