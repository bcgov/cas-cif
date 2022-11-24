-- Deploy cif:computed_columns/project_revision_total_project_value to pg

begin;

create or replace function cif.project_revision_total_project_value(project_revision cif.project_revision)
returns numeric
as
$computed_column$
  select
    (
      (select coalesce((new_form_data ->> 'proponentCost')::numeric, 0) + coalesce((new_form_data ->> 'maxFundingAmount')::numeric, 0)
        from cif.form_change fc
        where fc.project_revision_id = $1.id and fc.form_data_table_name = 'funding_parameter')
      +
      coalesce((select sum((new_form_data ->> 'amount')::numeric)
        from cif.form_change fc
        where fc.project_revision_id = $1.id
          and fc.form_data_table_name = 'additional_funding_source'
          and fc.new_form_data ->> 'status' = 'Approved'
          and operation != 'archive'), 0)
    );
$computed_column$ language sql stable;

grant execute on function cif.project_revision_total_project_value to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_total_project_value is
$$
    Computed column to return the total project value.
    Calculation:
    - Total Project Value = Maximum Funding Amount + Proponent Cost + Additional Funding Amount(s)
$$;

commit;
