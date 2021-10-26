begin;
select plan(2);

select has_schema('cif_private');
select matches(obj_description('cif_private'::regnamespace, 'pg_namespace'), '.+', 'Schema cif_private has a description');

select finish();
rollback;
