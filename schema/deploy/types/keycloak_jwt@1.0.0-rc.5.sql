-- Deploy cif:types/keycloak_jwt to pg
-- requires: schemas/main

begin;

create type cif.keycloak_jwt as (
  jti uuid,
  exp integer,
  nbf integer,
  iat integer,
  iss text,
  aud text,
  sub uuid,
  typ text,
  azp text,
  auth_time integer,
  session_state uuid,
  acr text,
  email_verified boolean,
  name text,
  preferred_username text,
  given_name text,
  family_name text,
  email text,
  broker_session_id text,
  priority_group text,
  user_groups text[]
);

comment on type cif.keycloak_jwt is E'@primaryKey sub\n@foreignKey (sub) references cif_user (uuid)';

commit;
