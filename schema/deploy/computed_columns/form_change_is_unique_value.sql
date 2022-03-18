-- Deploy cif:computed_columns/form_change_is_unique_value to pg

begin;

create or replace function cif.form_change_is_unique_value(fc cif.form_change, column_name text) returns boolean as
$computed_column$
declare
  is_unique boolean;
begin
  execute format(
    '
    select not exists(
      select 1
      from %s.%s
      where %s = $1
      and archived_at is null
      and id is distinct from $2
    )
    ',
    quote_ident(fc.form_data_schema_name),
    quote_ident(fc.form_data_table_name),
    quote_ident(cif_private.camel_to_snake_case(column_name))
  ) using
    jsonb_extract_path_text(fc.new_form_data, column_name),
    fc.form_data_record_id
  into is_unique;
  return is_unique;
end;
$computed_column$ language plpgsql stable;


commit;
