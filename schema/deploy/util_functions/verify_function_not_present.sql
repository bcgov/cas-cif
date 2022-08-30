-- Deploy cif:util_functions/verify_function_not_present to pg

begin;

drop function cif_private.verify_function_not_present;

create or replace function cif_private.verify_function_not_present(function_schema_name text, function_name text, number_of_parameters int)
returns boolean
as
$function$
begin
  if (select exists(
        select * from pg_proc
        join pg_namespace
          on pg_proc.pronamespace = pg_namespace.oid
          and pg_namespace.nspname = function_schema_name
          and proname=function_name
          and pronargs = number_of_parameters
      )
     ) then
      raise exception '% exists when it should not', function_name;
  else
    return true;
  end if;
end;
$function$
language 'plpgsql' stable;
comment on function cif_private.verify_function_not_present(text, text, int) is 'Utility function to use in a change verification or test to ensure that a function was deleted';

commit;
