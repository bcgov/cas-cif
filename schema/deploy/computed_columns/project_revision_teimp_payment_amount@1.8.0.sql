-- Deploy cif:computed_columns/project_revision_teimp_payment_amount to pg

begin;

create or replace function cif.project_revision_teimp_payment_amount(project_revision cif.project_revision)
returns numeric
as
$computed_column$

  select (cif.project_revision_teimp_payment_percentage($1) / 100.0)  * (cif.project_revision_gross_payment_amount($1) - cif.project_revision_net_payment_amount($1));

$computed_column$ language sql stable;

grant execute on function cif.project_revision_teimp_payment_amount to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_teimp_payment_amount is
$$
    Computed column to return the TEIMP payment amount, based on:
    - X% being the TEIMP payment percentage calculated from the emissions performance (Schedule G)
    - Gross and Net payment amounts to date
    Formula:
    TEIMP payment amount = X% * (Gross payment to date - Net payment to date)
$$;

commit;
