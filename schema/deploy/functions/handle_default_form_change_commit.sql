-- Deploy cif:functions/handle_default_form_change_commit to pg
-- requires: tables/form_change

begin;

create or replace function cif_private.handle_default_form_change_commit(fc cif.form_change)
  returns int as $$
declare
  query text;
  schema_table text;
  keys text;
  vals text;
  record_id int;
  json_key text;
  json_data jsonb;
  table_column_name text;
begin

  select fc.form_data_record_id into record_id;

  -- If there is no change in the form data, return the form_change record and do not touch the associated table.
  if (fc.new_form_data = '{}') then
    return fc.form_data_record_id;
  end if;

  if (fc.change_status = 'committed') then
    raise exception 'Cannot commit form_change. It has already been committed.';
  end if;

  /**
    Prune the form_data object of any deprecated columns.
    If a column is deprecated, but the key still exists in older form data records
    it will cause an error when trying to insert data into that column.
  **/
  json_data = fc.new_form_data;
  for json_key in (select key from jsonb_each(json_data))
  loop
    if (select quote_ident(cif_private.camel_to_snake_case(json_key))) not in (
      select column_name::text
        from information_schema.columns
        where table_schema = fc.form_data_schema_name
        and table_name   = fc.form_data_table_name
    ) then
      json_data = json_data - json_key;
    end if;
  end loop;

  /**
  we need to add null values for any columns that are not in the form_data object
  this is necessary because we may remove an optional field from the form but we don't update the data in the table because it is not in the form_data object
  We don't want this to happen when operation is create since we need to use the default values provided by the table
  **/
  if fc.operation = 'update' then
    for table_column_name in (
        select column_name::text
        from information_schema.columns
        where table_schema = fc.form_data_schema_name
          and table_name = fc.form_data_table_name
          and (select cif_private.snake_to_camel_case(column_name)) not in (select key from jsonb_each(json_data))
          and column_name::text not in ('id', 'created_at', 'updated_at', 'archived_at', 'created_by', 'updated_by', 'archived_by')
    )
    loop
      json_data = json_data || jsonb_build_object((select cif_private.snake_to_camel_case(table_column_name)), null);
    end loop;
  end if;

  schema_table := quote_ident(fc.form_data_schema_name) || '.' || quote_ident(fc.form_data_table_name);
  keys := (select array_to_string(array(select quote_ident(cif_private.camel_to_snake_case(key)) from jsonb_each(json_data)), ','));
  vals := (select array_to_string(array(select quote_nullable(value) from jsonb_each_text(json_data)), ','));

  if fc.operation = 'create' then
    if fc.form_data_record_id is not null then

      query := format(
        'insert into %s (id, %s) overriding system value values (%s , %s)',
        schema_table,
        keys,
        fc.form_data_record_id,
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
      execute query into record_id;
    end if;


  elsif fc.operation = 'update' then

    -- it is necessary to put the values in a row(...) in case there is only one value;
    query := format(
      'update %s set (%s) = (row(%s)) where id = $1',
      schema_table,
      keys,
      vals
    );

    raise debug '%', query;
    execute query using fc.form_data_record_id;
  elsif fc.operation = 'archive' then
    query := format(
      'update %s set archived_at = now() where id = $1',
      schema_table
    );

    raise debug '%', query;
    execute query using fc.form_data_record_id;
  end if;

  return record_id;
end;
$$ language plpgsql volatile;

grant execute on function cif_private.handle_default_form_change_commit to cif_internal, cif_external, cif_admin;

comment on function cif_private.handle_default_form_change_commit
  is $$
    The default function used to parse form_change data into table data when the status of the form_change record is set to 'committed'.
    This function can be used on any flat form_change record that has a 1:1 relationship with a table. Any form_change record that needs
    to be parsed into more than one table will need to use its own unique function.
  $$;

commit;
