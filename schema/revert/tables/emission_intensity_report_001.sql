-- Revert cif:tables/emission_intensity_report_001 from pg

begin;

/**
  The revert for emission_intensity_report_001 should already have been run in computed_columns/form_change_as_project as the columns need to be
  dropped for the function to properly be reverted. This revert will only be called in a development context where sqitch
  only got deployed to emission_intensity_report_001.
**/

alter table cif.emission_intensity_report
  drop column if exists adjusted_holdback_payment_amount,
  drop column if exists date_sent_to_csnr;

commit;
