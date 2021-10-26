-- Deploy cif:util_functions/read_only_user_policies to pg

begin;

create or replace function cif_private.read_only_user_policies(
  read_only_user text,
  table_schema_name text default 'cif'
)
returns void as $function$
  declare
    declare
    table_record record;
    policy_prefix text;
    policy_name text;
    create_policy_statement text;
  begin
    for table_record in
      select table_name::text from information_schema.tables
      where table_schema = table_schema_name
      and table_type = 'BASE TABLE'
    loop
      policy_name:=concat(read_only_user, '_select_', table_record.table_name);

      if (select not exists(select polname from pg_policy where polname=policy_name)) then
        create_policy_statement:= concat(
          'create policy ', policy_name, ' on ', table_schema_name, '.',
          table_record.table_name, ' for select to ', read_only_user, ' using (true)'
        );
        execute create_policy_statement;
      else
        raise notice 'POLICY: % already exists. Policy not created.', policy_name;
      end if;

    end loop;
  end;
$function$ language plpgsql;

commit;
