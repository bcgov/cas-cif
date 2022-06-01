-- Deploy cif:types/milestone_report_status_return to pg

begin;

create type cif.milestone_report_status_return as (
  milestone_index int,
  reporting_requirement_status text,
  form_completion_status text
);

commit;
