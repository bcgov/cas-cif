-- Deploy ggircs-app:mutations/create_user_from_session to pg

begin;

create or replace function cif.create_user_from_session()
returns cif.cif_user
as $function$
declare
  jwt cif.keycloak_jwt;
  result cif.cif_user;
begin
  select * from cif.session() into jwt;

  if ((select count(*) from cif.cif_user where uuid = jwt.sub) = 0) then
    insert into cif.cif_user(uuid, given_name, family_name, email_address)
    values (jwt.sub, jwt.given_name, jwt.family_name, jwt.email);
  end if;


  select * from cif.cif_user where uuid = jwt.sub into result;
  return result;
end;
$function$ language plpgsql strict volatile;

grant execute on function cif.create_user_from_session to cif_internal, cif_external, cif_admin;

commit;
