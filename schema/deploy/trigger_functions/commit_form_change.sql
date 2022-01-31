-- Deploy cif:trigger_functions/commit_form_changes to pg
-- requires: schemas/private

begin;

create or replace function cif_private.commit_form_change()
  returns trigger as $$
declare
  query text;
  schema_table text;
  keys text;
  vals text;
begin

  if new.operation not in ('INSERT', 'UPDATE') then
    raise exception 'Cannot commit change with operation %', new.operation;
  end if;

  if not (select triggers_commit from cif.change_status where status = new.change_status) then
    return new;
  end if;

  -- If there is no change in the form data, return the form_change record and do not touch the associated table.
  if (new.new_form_data = '{}') then
    return new;
  end if;

  -- If the form has errors set, we don't commit the change and abort the transaction.
  if new.validation_errors != '[]' then
    raise exception 'Cannot commit change with validation errors: %', new.validation_errors;
  end if;

  schema_table := quote_ident(new.form_data_schema_name) || '.' || quote_ident(new.form_data_table_name);
  keys := (select array_to_string(array(select quote_ident(cif_private.camel_to_snake_case(key)) from jsonb_each(new.new_form_data)), ','));
  vals := (select array_to_string(array(select quote_nullable(value) from jsonb_each_text(new.new_form_data)), ','));

  if new.operation = 'INSERT' then
    if new.form_data_record_id is not null then

      query := format(
        'insert into %s (id, %s) overriding system value values (%s , %s)',
        schema_table,
        keys,
        new.form_data_record_id,
        vals
      );
      raise debug '%', query;
      execute query;
    else
      query := format(
        'insert into %s (%s) values (%s) returning id',
        schema_table,
        keys,
        vals
      );
      raise debug '%', query;
      execute query into new.form_data_record_id;
    end if;


  elsif new.operation = 'UPDATE' then

    -- it is necessary to put the values in a row(...) in case there is only one value;
    query := format(
      'update %s set (%s) = (row(%s)) where id = $1',
      schema_table,
      keys,
      vals
    );

    raise debug '%', query;
    execute query using new.form_data_record_id;
  end if;

  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.commit_form_change to cif_internal, cif_external, cif_admin;

comment on function cif_private.commit_form_change()
  is $$
  A trigger set on the cif.form_change table.
  This trigger will be used when a form_change status is committed, and will apply the change to the form_data_table_name table.
  The new_form_data value is expected to be a flat jsonb object, with the keys being a camelCase version of the form_data_table_name columns.
  $$;

commit;
