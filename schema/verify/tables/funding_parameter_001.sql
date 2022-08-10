-- Verify cif:tables/funding_parameter_001 on pg

begin;

select column_name
from information_schema.columns
where table_schema='cif' and table_name='funding_parameter' and column_name='proponent_cost';

rollback;
