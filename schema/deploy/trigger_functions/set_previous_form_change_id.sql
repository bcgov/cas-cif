-- Deploy cif:trigger_functions/set_previous_form_change_id to pg
-- requires: tables/form_change

begin;
  create or replace function cif_private.set_previous_form_change_id()
    returns trigger as $$
  begin
    new.previous_form_change_id = (
      select id from cif.form_change
        where form_data_schema_name = new.form_data_schema_name
        and form_data_table_name = new.form_data_table_name
        and form_data_record_id = new.form_data_record_id
        and change_status='committed'
      order by updated_at desc, id desc limit 1
    );
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
