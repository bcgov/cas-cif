-- Deploy cif:trigger_functions/set_initial_ancestor_form_change_ids to pg

begin;
  create or replace function cif_private.set_initial_ancestor_form_change_ids()
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
    new.original_parent_form_change_id = new.previous_form_change_id;
    return new;
  end;
  $$ language plpgsql volatile;

grant execute on function cif_private.set_initial_ancestor_form_change_ids to cif_internal,cif_external,cif_admin;

comment on function cif_private.set_initial_ancestor_form_change_ids()
  is $$
  a trigger to set a previous_form_change_id, and original_parent_form_change_id foreign key columns.
  When a form_change is first created, the two values are the same.
  example usage:

  create table some_schema.some_table (
    previous_form_change_id int references cif.form_change(id)
    original_parent_form_change_id int references cif.form_change(id)
    ...
  );
  create trigger _set_initial_ancestor_form_change_ids
    before insert on some_schema.some_table
    for each row
    execute procedure cif_private.set_initial_ancestor_form_change_ids();
  $$;

commit;
