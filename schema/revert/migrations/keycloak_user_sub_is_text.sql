-- Revert cif:migrations/keycloak_user_sub_is_text from pg

begin;

drop policy cif_internal_insert_cif_user on cif.cif_user;
drop policy cif_internal_update_cif_user on cif.cif_user;
drop policy cif_external_insert_cif_user on cif.cif_user;
drop policy cif_external_update_cif_user on cif.cif_user;
drop policy cif_guest_select_cif_user on cif.cif_user;

drop function cif.session();

drop type cif.keycloak_jwt;

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

-- session function
create or replace function cif.session()
    returns cif.keycloak_jwt as
$function$
declare
  _sub text := current_setting('jwt.claims.sub', true);
  _idir_userid text := current_setting('jwt.claims.idir_userid', true);
begin
  if ((coalesce(trim(_sub), '') = '') is not false and (coalesce(trim(_idir_userid), '') = '') is not false) then
    return null; -- ensure null, empty, and whitespace _sub / idir_userid claims are filtered out
  end if;
  return (
    select row (
      current_setting('jwt.claims.jti', true),
      current_setting('jwt.claims.exp', true),
      current_setting('jwt.claims.nbf', true),
      current_setting('jwt.claims.iat', true),
      current_setting('jwt.claims.iss', true),
      current_setting('jwt.claims.aud', true),
      coalesce(_idir_userid, _sub), -- unique identifier can never be null
      current_setting('jwt.claims.typ', true),
      current_setting('jwt.claims.azp', true),
      current_setting('jwt.claims.auth_time', true),
      current_setting('jwt.claims.session_state', true),
      current_setting('jwt.claims.acr', true),
      current_setting('jwt.claims.email_verified', true),
      current_setting('jwt.claims.name', true),
      current_setting('jwt.claims.preferred_username', true),
      current_setting('jwt.claims.given_name', true),
      current_setting('jwt.claims.family_name', true),
      current_setting('jwt.claims.email', true),
      current_setting('jwt.claims.broker_session_id', true),
      current_setting('jwt.claims.priority_group', true),
      (select string_to_array(current_setting('jwt.claims.user_groups', true), ','))
    )::cif.keycloak_jwt
  );
end
$function$ language 'plpgsql' stable;

grant execute on function cif.session to cif_internal, cif_external, cif_admin, cif_guest;

alter table cif.cif_user
  alter column session_sub type uuid using session_sub::uuid;
alter table cif.cif_user
  rename column session_sub to uuid;

drop index cif.cif_user_session_sub;
create unique index cif_user_uuid on cif.cif_user(uuid);

comment on column cif.cif_user.uuid is 'Universally Unique ID for the user, defined by the single sign-on provider';

do
$policy$
begin

-- cif_internal RLS: can see all users, but can only modify its own record
perform cif_private.upsert_policy('cif_internal_insert_cif_user', 'cif_user', 'insert', 'cif_internal', 'uuid=(select sub from cif.session())');
perform cif_private.upsert_policy('cif_internal_update_cif_user', 'cif_user', 'update', 'cif_internal', 'uuid=(select sub from cif.session())');

-- cif_external RLS: can see all users, but can only modify its own record
perform cif_private.upsert_policy('cif_external_insert_cif_user', 'cif_user', 'insert', 'cif_external', 'uuid=(select sub from cif.session())');
perform cif_private.upsert_policy('cif_external_update_cif_user', 'cif_user', 'update', 'cif_external', 'uuid=(select sub from cif.session())');

-- cif_guest RLS: can only see its own (empty) record
perform cif_private.upsert_policy('cif_guest_select_cif_user', 'cif_user', 'select', 'cif_guest', 'uuid=(select sub from cif.session())');

end
$policy$;

commit;
