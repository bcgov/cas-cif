-- Verify cif:tables/project_revision_001_add_amendment_columns on pg

begin;

select column_name
from information_schema.columns
where table_schema='cif' and table_name='project_revision' and column_name='type';

select column_name
from information_schema.columns
where table_schema='cif' and table_name='project_revision' and column_name='comments';

select column_name
from information_schema.columns
where table_schema='cif' and table_name='project_revision' and column_name='amendment_status';

rollback;
