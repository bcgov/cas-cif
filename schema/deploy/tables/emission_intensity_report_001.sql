-- Deploy cif:tables/emission_intensity_report_001 to pg
-- requires: tables/emission_intensity_report

begin;

alter table cif.emission_intensity_report
  add column adjusted_holdback_payment_amount numeric;

commit;
