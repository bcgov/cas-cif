-- Deploy cif:computed_columns/project_revision_anticipated_funding_amount_by_fiscal_year to pg

begin;

create or replace function cif.project_revision_anticipated_funding_amount_per_fiscal_year(project_revision cif.project_revision)
returns setof cif.sum_by_fiscal_year
as
$computed_column$

 with payments as (
   select (new_form_data->>'reportingRequirementId') as rep_req_id, (new_form_data->>'dateSentToCsnr')::timestamptz as payment_date, (new_form_data->>'adjustedNetAmount')::numeric as payment_amount
   from cif.form_change fc
   where fc.project_revision_id = $1.id
    and form_data_table_name = 'payment'
 ),
 maximum_amounts as (
   select (new_form_data->>'reportingRequirementId') as rep_req_id, (new_form_data->>'maximumAmount')::numeric as milestone_amount
   from cif.form_change fc
   where fc.project_revision_id = $1.id
   and form_data_table_name = 'milestone_report'
 ),
 consolidated as (
   select p.payment_date, p.payment_amount, (rfc.new_form_data->>'reportDueDate')::timestamptz as milestone_date, m.milestone_amount
   from maximum_amounts m
   left join payments p on m.rep_req_id = p.rep_req_id
   left join cif.form_change rfc on rfc.form_data_record_id = m.rep_req_id::int
   and rfc.form_data_table_name = 'reporting_requirement'
 ),
 fiscal as (
      select
        coalesce(cif.get_fiscal_year_from_timestamp(payment_date), cif.get_fiscal_year_from_timestamp(milestone_date)) as fiscal_year,
        coalesce(payment_amount, milestone_amount, 0) as amount from consolidated
 ) select fiscal_year, sum(amount) as anticipated_funding_amount from fiscal group by fiscal_year;

$computed_column$ language sql stable;

grant execute on function cif.project_revision_anticipated_funding_amount_per_fiscal_year to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_anticipated_funding_amount_per_fiscal_year is 'Computed column to calculate the anticipated amount of funding for a project by fiscal year';

commit;
