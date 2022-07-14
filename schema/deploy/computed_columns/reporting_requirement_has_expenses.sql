-- Deploy cif:computed_columns/reporting_requirement_has_expenses to pg
-- requires: tables/report_type
-- requires: tables/reporting_requirement

begin;

create function cif.reporting_requirement_has_expenses(cif.reporting_requirement)
returns boolean as
$computed_column$
  select has_expenses
  from cif.report_type
  where name = $1.report_type;
$computed_column$ language sql stable;

comment on function cif.reporting_requirement_has_expenses(cif.reporting_requirement) is
  'Returns the value of the has_expenses column for the report_type of the given reporting_requirement';

commit;
