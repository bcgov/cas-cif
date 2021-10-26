begin;
select plan(2);

select has_schema('cif');
select matches(obj_description('cif'::regnamespace, 'pg_namespace'), '.+', 'Schema cif has a description');

select finish();
rollback;
