-- Deploy cif:util_functions/grant_permissions to pg

begin;

-- Grants permission for all columns in a table
create or replace function cif_private.grant_permissions(
  operation text,
  table_name text,
  role_name text,
  table_schema text default 'cif'
)
returns void
as
$function$
  declare
    column_name text;
  begin
    if (lower(operation) not in ('select', 'insert', 'update', 'delete')) then
      raise exception 'invalid operation variable. Must be one of [select, insert, update, delete]';
    else
      execute format(
        'grant ' || quote_ident(operation) ||
        ' on ' || quote_ident(table_schema) || '.' || quote_ident(table_name) ||
        ' to ' || quote_ident(role_name)
      );
    end if;
  end;
$function$
language 'plpgsql' volatile;

comment on function cif_private.grant_permissions(text, text, text, text) is
  'A generic function for granting access-control permissions on all columns of a table';

-- Grants permissions on specific columns in a table
create or replace function cif_private.grant_permissions(
  operation text,
  table_name text,
  role_name text,
  column_names text[],
  table_schema text default 'cif'
)
returns void
as
$function$
  declare
    column_name text;
  begin
    if (lower(operation) not in ('select', 'insert', 'update', 'delete')) then
      raise exception 'invalid operation variable. Must be one of [select, insert, update, delete]';
    else
      foreach column_name in ARRAY column_names
      loop
        execute format(
          'grant ' || quote_ident(operation) || ' (' || quote_ident(column_name) ||
          ') on ' || quote_ident(table_schema) || '.' || quote_ident(table_name) ||
          ' to ' || quote_ident(role_name)
        );
      end loop;
    end if;
  end;
$function$
language 'plpgsql' volatile;

comment on function cif_private.grant_permissions(text, text, text, text[], text) is
  'A generic function for granting access-control permissions on specific columns of a table';

commit;
