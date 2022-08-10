-- Verify cif:tables/emission_intensity_report_001 on pg

begin;

select column_name
from information_schema.columns
where table_name='emission_intensity_report' and column_name='adjusted_holdback_payment_amount';

rollback;
