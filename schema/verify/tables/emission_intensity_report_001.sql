-- Verify cif:tables/emission_intensity_report_001 on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='emission_intensity_report' and column_name='adjusted_holdback_payment_amount'
    ), 'column "adjusted_holdback_payment_amount" is not defined on table "emission_intensity_report"';
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='emission_intensity_report' and column_name='date_sent_to_csnr'
    ), 'column "date_sent_to_csnr" is not defined on table "emission_intensity_report"';
  end;
$$;

rollback;
