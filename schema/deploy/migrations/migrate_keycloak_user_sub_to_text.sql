-- Deploy cif:migrations/migrate_keycloak_user_sub_to_text to pg
-- requires: functions/keycloak_user_sub_is_text

begin;

select cif_private.keycloak_user_sub_is_text();

-- replace uuid with session_sub in contact_pending_form_change computed column
create or replace function cif.contact_pending_form_change(cif.contact) returns cif.form_change as $$
  select * from cif.form_change
  where form_data_schema_name = 'cif'
  and form_data_table_name = 'contact'
  and form_data_record_id = $1.id
  and change_status = 'pending'
  and created_by = (select id from cif.cif_user where session_sub = (select sub from cif.session()));
$$ language sql stable;

comment on function cif.contact_pending_form_change(cif.contact) is 'Returns the pending form change editing the contact created by the current user, if it exists.';

-- replace uuid with session_sub in operator_pending_form_change computed column
create or replace function cif.operator_pending_form_change(cif.operator) returns cif.form_change as $$
  select * from cif.form_change
  where form_data_schema_name = 'cif'
  and form_data_table_name = 'operator'
  and form_data_record_id = $1.id
  and change_status = 'pending'
  and created_by = (select id from cif.cif_user where session_sub = (select sub from cif.session()));
$$ language sql stable;

comment on function cif.operator_pending_form_change(cif.operator) is 'Returns the pending form change editing the operator created by the current user, if it exists.';

-- replace uuid with session_sub in pending_new_form_change_for_table function
create or replace function cif.pending_new_form_change_for_table(table_name text) returns cif.form_change as
$$
  select * from cif.form_change
  where form_data_table_name = $1
  and form_data_schema_name = 'cif'
  and operation = 'create'
  and change_status = 'pending'
  and created_by = (select id from cif.cif_user where session_sub = (select sub from cif.session()))
  order by created_at desc
  limit 1;
$$ language 'sql' stable;

comment on function cif.pending_new_form_change_for_table(text) is
  'returns a form_change for a table in the pending state for the current user, i.e. allows to resume the creation of any table row';

-- replace uuid with session_sub in pending_new_project_revision function
create or replace function cif.pending_new_project_revision() returns cif.project_revision as
$$
  select * from cif.project_revision
  where project_id is null
  and created_by = (select id from cif.cif_user where session_sub = (select sub from cif.session()))
  limit 1;
$$ language 'sql' stable;

comment on function cif.pending_new_project_revision() is
  'returns a project_revision for a new project in the pending state for the current user, i.e. allows to resume a project creation';

-- replace uuid with session_sub in create_user_from_session mutation
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

-- replace uuid with session_sub in set_user_id trigger
create or replace function cif_private.set_user_id()
  returns trigger as $$
declare
  user_sub text;
begin
  user_sub := (select sub from cif.session());
  new.user_id := (select id from cif.cif_user as u where u.session_sub = user_sub);
  return new;
end
$$ language plpgsql volatile;

grant execute on function cif_private.set_user_id to cif_internal,cif_external,cif_admin;

comment on function cif_private.set_user_id()
  is $$
  a trigger to set a user_id foreign key column.
  example usage:

  create table some_schema.some_table (
    user_id int references cif.cif_user(id)
    ...
  );
  create trigger _set_user_id
    before update of some_column on some_schema.some_table
    for each row
    execute procedure cif_private.set_user_id();
  $$;

commit;
