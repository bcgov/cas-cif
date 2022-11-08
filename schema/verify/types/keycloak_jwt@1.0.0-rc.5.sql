-- Verify cif:type_keycloak_jwt on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'keycloak_jwt'
    ), 'type "keycloak_jwt" is not defined';
  end;
$$;

rollback;
