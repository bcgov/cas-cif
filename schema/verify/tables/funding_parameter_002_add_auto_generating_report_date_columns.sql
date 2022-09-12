-- Verify cif:tables/funding_parameter_002_add_auto_generating_report_date_columns on pg

begin;

select column_name
from information_schema.columns
where table_schema='cif' and table_name='funding_parameter' and column_name='contract_start_date';

select column_name
from information_schema.columns
where table_schema='cif' and table_name='funding_parameter' and column_name='project_assets_life_end_date';

rollback;
