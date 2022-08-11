-- Deploy cif:tables/emission_intensity_report_001 to pg
-- requires: tables/emission_intensity_report

begin;

alter table cif.emission_intensity_report
  add column adjusted_holdback_payment_amount numeric,
  add column date_sent_to_csnr timestamptz;

comment on column cif.emission_intensity_report.adjusted_holdback_payment_amount is 'An override field to manually adjust the calculated TEIMP holdback payment amount';
comment on column cif.emission_intensity_report.date_sent_to_csnr is 'The date the payment was issued';


commit;
