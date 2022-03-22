-- Deploy cif:trigger_functions/set_previous_form_change_id to pg
-- requires: tables/form_change

begin;
create or replace function cif_private.set_previous_form_change_id()
  returns trigger as $$
begin
  new.previous_form_change_id = (select id from cif.form_change where project_revision_id = new.project_revision_id and change_status='committed' order by id desc limit 1);
  return new;
end;
$$ language plpgsql volatile;

grant execute on function cif_private.set_previous_form_change_id to cif_internal,cif_external,cif_admin;

comment on function cif_private.set_previous_form_change_id()
  is $$
  a trigger to set a previous_form_change_id foreign key column.
  example usage:

  create table some_schema.some_table (
    previous_form_change_id int references cif.form_change(id)
    ...
  );
  create trigger _set_previous_form_change_id
    before insert on some_schema.some_table
    for each row
    execute procedure cif_private.set_previous_form_change_id();
  $$;

commit;
