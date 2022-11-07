-- Revert cif:trigger_functions/set_user_id_001_drop_before_cif_user_update from pg

begin;
create or replace function cif_private.set_user_id()
  returns trigger as $$

declare
  user_sub uuid;
begin
  user_sub := (select sub from cif.session());
  new.user_id := (select id from cif.cif_user as u where u.uuid = user_sub);
  return new;
end;
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
