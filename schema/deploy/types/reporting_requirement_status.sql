-- Deploy cif:types/reporting_requirement_status to pg

begin;

create type cif.reporting_requirement_status as enum (
  'on_track',
  'late',
  'completed',
  'in_review'
);

comment on type cif.reporting_requirement_status is 'The status of a reporting requirement.';

commit;
