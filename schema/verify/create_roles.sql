-- Verify cif:create_roles on pg

begin;

do
$verify$
begin


  if(select not exists(select true from pg_roles where rolname='cif_internal')) then
    raise exception 'role cif_internal does not exist.';

  elsif(select not exists(select true from pg_roles where rolname='cif_external')) then
    raise exception 'role cif_external does not exist.';

  elsif(select not exists(select true from pg_roles where rolname='cif_admin')) then
    raise exception 'role cif_admin does not exist.';

  elsif(select not exists(select true from pg_roles where rolname='cif_guest')) then
    raise exception 'role cif_guest does not exist.';

  end if;

end
$verify$;

rollback;
