-- Deploy cif:util_functions/get_fiscal_year_from_timestamp to pg

begin;

create or replace function cif.get_fiscal_year_from_timestamp(ts timestamptz)
returns text
as
$fn$

  select case
    when ts::date < (select to_char(ts, 'YYYY') || '-04-01')::date then
      to_char(date_trunc('year', ts) - interval '1 year', 'YYYY') || '/' || to_char(ts, 'YYYY')
    else
      to_char(ts, 'YYYY') || '/' || to_char(date_trunc('year', ts) + interval '1 year', 'YYYY')
  end;

$fn$ language sql stable;

grant execute on function cif.get_fiscal_year_from_timestamp to cif_internal, cif_external, cif_admin;

comment on function cif.get_fiscal_year_from_timestamp is 'A utility function that ingests a timestamp and returns the fiscal year the timestamp is from';

commit;
