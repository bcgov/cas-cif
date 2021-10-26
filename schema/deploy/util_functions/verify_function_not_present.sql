-- Deploy cif:util_functions/verify_function_not_present to pg

begin;

create or replace function cif_private.verify_function_not_present(function_name text)
returns boolean
as
$function$
begin
  if (select exists(select * from pg_proc where proname=function_name)) then
    raise exception '% exists when it should not', function_name;
  else
    return true;
  end if;
end;
$function$
language 'plpgsql' stable;
comment on function cif_private.verify_function_not_present(text) is 'Utility function to use in a change verification or test to ensure that a function was deleted';

commit;
