-- Deploy cif:types/additional_funding_source_status to pg

begin;

create type cif.additional_funding_source_status as enum (
  'awaiting approval',
  'approved',
  'denied'
);

comment on type cif.additional_funding_source_status is 'The status of an additional funding source.';

commit;
