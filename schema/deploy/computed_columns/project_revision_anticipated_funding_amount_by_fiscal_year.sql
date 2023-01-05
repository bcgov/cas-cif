-- Deploy cif:computed_columns/project_revision_anticipated_funding_amount_by_fiscal_year to pg

begin;

create or replace function cif.project_revision_anticipated_funding_amount_per_fiscal_year(project_revision cif.project_revision)
returns setof cif.sum_by_fiscal_year
as
$computed_column$

with form_changes as (
    select * from cif.form_change
    where project_revision_id = 253
    -- where project_revision_id = $1.project_id
    and form_data_schema_name='cif'
    and form_data_table_name='reporting_requirement'
    and (new_form_data->>'reportType') in (select name from cif.report_type where has_expenses=true)
    and operation != 'archive'
),

stuff as (
    select
        cif.get_fiscal_year_from_timestamp((select (new_form_data->>'dateSentToCsnr')::timestamptz)) as fiscal,
        sum(
            coalesce(
                (select new_form_data->'adjustedGrossAmount')::numeric,
                (select cif.form_change_calculated_gross_amount_this_milestone(row(form_changes.*))),
                (new_form_data->>'maximumAmount')::numeric
            )
        )
    from form_changes
    group by fiscal
)

select * from stuff;
-- may need to create jsonb object for return


$computed_column$ language sql stable;

grant execute on function cif.project_revision_anticipated_funding_amount_per_fiscal_year to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_anticipated_funding_amount_per_fiscal_year is 'Computed column to calculate the anticipated amount of funding for a project by fiscal year';

commit;
