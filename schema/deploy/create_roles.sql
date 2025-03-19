-- Deploy cif:create_roles to pg

begin;

-- The create roles affects the database globally. Cannot drop the roles once created.
do
$do$
begin

  if not exists (
    select true
    from   pg_catalog.pg_roles
    where  rolname = 'cif_internal') then

    create role cif_internal;
  end if;

  if not exists (
    select true
    from   pg_catalog.pg_roles
    where  rolname = 'cif_external') then

    create role cif_external;
  end if;

  if not exists (
    select true
    from   pg_catalog.pg_roles
    where  rolname = 'cif_admin') then

    create role cif_admin;
  end if;

  if not exists (
    select true
    from   pg_catalog.pg_roles
    where  rolname = 'cif_guest') then

    create role cif_guest;
  end if;

  if not exists (
    select true
    from   pg_catalog.pg_roles
    where  rolname = 'cifapp') then

    create user cifapp;
  end if;

  grant cif_admin, cif_internal, cif_external, cif_guest to cifapp;
  execute format('grant create, connect on database %I to cifapp', current_database());

end
$do$;

commit;
