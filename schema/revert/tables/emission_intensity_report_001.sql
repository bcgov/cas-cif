-- Revert cif:tables/emission_intensity_report_001 from pg

begin;

alter table cif.emission_intensity_report
  drop column adjusted_holdback_payment_amount;

commit;
