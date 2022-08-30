-- Verify cif:tables/project_revision_001 on pg

begin;

select column_name
from information_schema.columns
where table_schema='cif' and table_name='project_revision' and column_name='type';

select column_name
from information_schema.columns
where table_schema='cif' and table_name='project_revision' and column_name='comments';

rollback;
