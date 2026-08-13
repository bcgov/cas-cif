-- Deploy cif:types/keycloak_jwt to pg
-- requires: schemas/main

begin;

  alter type cif.keycloak_jwt drop attribute session_state;
  alter type cif.keycloak_jwt add attribute session_state uuid;

commit;
