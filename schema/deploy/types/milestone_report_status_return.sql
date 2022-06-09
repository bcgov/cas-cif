-- Deploy cif:types/milestone_report_status_return to pg

begin;

create type cif.milestone_report_status_return as (
  milestone_index int,
  report_due_date timestamptz,
  submitted_date timestamptz,
  form_completion_status text
);

commit;
