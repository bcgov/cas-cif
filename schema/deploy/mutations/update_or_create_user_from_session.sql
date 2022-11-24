-- Deploy cif:mutations/update_or_create_user_from_session to pg

-- This function replaces the old cif.create_user_from_session
-- and updates users based on email (unique in the IDIR realm) instead

begin;

create or replace function cif.update_or_create_user_from_session()
returns cif.cif_user
as $function$
declare
  jwt cif.keycloak_jwt;
  result cif.cif_user;
begin
  select * from cif.session() into jwt;

  -- if we have a conflict on session_sub but not email, then multiple accounts are
  -- sharing the session_sub, something is broken and we should error out.

  insert into cif.cif_user(session_sub, given_name, family_name, email_address)
  values (jwt.sub, jwt.given_name, jwt.family_name, jwt.email)
  on conflict(email_address) do update 
  set session_sub=excluded.session_sub, 
      given_name=excluded.given_name, 
      family_name=excluded.family_name;

  select * from cif.cif_user where session_sub = jwt.sub into result;
  return result;
end;
$function$ language plpgsql strict volatile;

grant execute on function cif.update_or_create_user_from_session to cif_internal, cif_external, cif_admin;

commit;