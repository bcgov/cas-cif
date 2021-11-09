-- Deploy cif:trigger_functions/save_form_changes to pg
-- requires: schemas/private

begin;

create or replace function cif_private.save_form_changes()
  returns trigger as $$

declare
  query text;
  keys text;
  values text;
  schema_table text;

begin
  keys := (select array_to_string(array(select jsonb_object_keys(new.new_form_data)), ','));
  values := (select array_to_string(array((select quote_literal(value::text) from jsonb_each(new.new_form_data))), ','));
  schema_table := new.form_data_schema_name || '.' || new.form_data_table_name;
  if (select triggers_save from cif.change_status where status = new.change_status) then

    if new.operation = 'INSERT' then
      query := 'insert into ' || schema_table || '(id,' || keys ||') overriding system value values ('|| new.form_data_record_id ||', '|| values || ')';
    raise notice '%', query;
      EXECUTE query;
    elsif new.operation = 'UPDATE' then
      raise notice 'UPDATE STUFF NOW';
    elsif new.operation = 'DELETE' then
      raise notice 'NO DELETE, BAD DYLAN!';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.save_form_changes to cif_internal, cif_external, cif_admin;

comment on function cif_private.save_form_changes()
  is $$
  a trigger to set created_at and updated_at columns.
  example usage:

  create table some_schema.some_table (
    ...
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
  );
  create trigger _100_timestamps
    before insert or update on some_schema.some_table
    for each row
    execute procedure cif_private.save_form_changes();
  $$;

commit;
