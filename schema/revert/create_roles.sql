-- Revert cif:create_roles from pg

begin;

do
$do$
begin
raise NOTICE 'Created roles may be used in other projects, and need to be manually deleted if needed';
end;
$do$;

select true;

commit;
