-- Deploy cif:mutations/create_user_from_session_002_create_after_cif_user_update to pg
-- requires: mutations/create_user_from_session_001_drop_before_cif_user_update

begin;

create or replace function cif.create_user_from_session()
returns cif.cif_user
as $function$
declare
  jwt cif.keycloak_jwt;
  result cif.cif_user;
begin
  select * from cif.session() into jwt;

  if ((select count(*) from cif.cif_user where session_sub = jwt.sub) = 0) then
    insert into cif.cif_user(session_sub, given_name, family_name, email_address)
    values (jwt.sub, jwt.given_name, jwt.family_name, jwt.email);
  end if;


  select * from cif.cif_user where session_sub = jwt.sub into result;
  return result;
end;
$function$ language plpgsql strict volatile;

grant execute on function cif.create_user_from_session to cif_internal, cif_external, cif_admin;

commit;
