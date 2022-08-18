-- Verify cif:tables/project_001 on pg

begin;

select column_name
from information_schema.columns
where table_schema='cif' and table_name='project' and column_name='score';

select column_name
from information_schema.columns
where table_schema='cif' and table_name='project' and column_name='project_type';

rollback;
