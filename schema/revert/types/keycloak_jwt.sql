-- Revert cif:types/keycloak_jwt from pg

begin;

drop type cif.keycloak_jwt;

commit;
