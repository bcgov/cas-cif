-- Deploy cif:computed_columns/form_change_total_project_value to pg
create or replace function cif.form_change_total_project_value(cif.form_change)
returns numeric
as
$computed_column$
with additional_funding_sources as
    (
        select * from jsonb_to_recordset(
        (select (new_form_data ->> 'additionalFundingSources')
        from cif.form_change fc
        where fc.project_revision_id = $1.project_revision_id
        and fc.form_data_table_name = 'funding_parameter'
        and operation != 'archive'
        )::jsonb
      ) as x(source text, amount numeric, status text)
    ),
additional_funding_sources_sum as
    (
        select
            sum(case when status = 'Approved' then amount::numeric
                     when status = 'Denied' then 0
                     when status = 'Awaiting Approval' then 0
            end) as total
        from additional_funding_sources
    )
select
  case
    when
      (
        ($1.new_form_data ->> 'proponentCost')::numeric IS NULL
        OR
        ($1.new_form_data ->> 'maxFundingAmount')::numeric IS NULL
      ) THEN NULL
    else
      (
        coalesce(($1.new_form_data ->> 'proponentCost')::numeric, 0)
        +
        coalesce(($1.new_form_data ->> 'maxFundingAmount')::numeric, 0)
        +
        coalesce((select total from additional_funding_sources_sum), 0)
      )
  end;
$computed_column$ language sql stable;
