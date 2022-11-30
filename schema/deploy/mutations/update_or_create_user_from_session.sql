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

  if (select count(*) from cif.cif_user where session_sub=jwt.sub) = 0
  then

    insert into cif.cif_user(session_sub, given_name, family_name, email_address, allow_sub_update)
    values (jwt.sub, jwt.given_name, jwt.family_name, jwt.email, false)
    on conflict(email_address) do
    update
    set session_sub=excluded.session_sub,
        given_name=excluded.given_name,
        family_name=excluded.family_name,
        allow_sub_update=false;

  end if;

  select * from cif.cif_user where session_sub = jwt.sub into result;
  return result;
end;
$function$ language plpgsql strict volatile security definer;

grant execute on function cif.update_or_create_user_from_session to cif_internal, cif_external, cif_admin;

comment on function cif.update_or_create_user_from_session is 'Function creates a user if a user with the matching session_sub does not exist, otherwise returns the matching user';

commit;
