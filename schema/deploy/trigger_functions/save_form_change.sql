-- Deploy cif:trigger_functions/save_form_changes to pg
-- requires: schemas/private

begin;

create or replace function cif_private.save_form_change()
  returns trigger as $$
declare
  query text;
  schema_table text;
  keys text;
  vals text;
  next_id integer;
  next_jsonb_record jsonb;
  next_record_type text;
begin

  if new.operation not in ('INSERT', 'UPDATE') then
    raise exception 'Cannot save change with operation %', new.operation;
  end if;

  schema_table := quote_ident(new.form_data_schema_name) || '.' || quote_ident(new.form_data_table_name);
  keys := (select array_to_string(array(select quote_ident(key) from jsonb_each(new.new_form_data)), ','));
  vals := (select array_to_string(array(select quote_literal(value) from jsonb_each_text(new.new_form_data)), ','));

  if (select triggers_save from cif.change_status where status = new.change_status) then

    if new.operation = 'INSERT' then

      query := format(
        'insert into %s (id, %s) overriding system value values (%s , %s)', 
        schema_table, 
        keys,
        new.form_data_record_id,
        vals
      );
      raise notice '%', query;
      execute query using next_jsonb_record;
      
    elsif new.operation = 'UPDATE' then

      -- it is necessary to put the values in a row(...) in case there is only one value;
      query := format(
        'update %s set (%s) = (row(%s)) where id = $1',
        schema_table,
        keys,
        vals
      );

      raise notice '%', query;
      execute query using new.form_data_record_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.save_form_change to cif_internal, cif_external, cif_admin;

comment on function cif_private.save_form_change()
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
    execute procedure cif_private.save_form_change();
  $$;

commit;
