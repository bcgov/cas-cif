-- Deploy cif:util_functions/snake_to_camel_case.sql to pg

begin;

create or replace function cif_private.snake_to_camel_case(text) returns text as $$
declare
  result text := '';
  next_upper boolean := false;
begin
  -- Loop through each character in the input text
  for i in 1..length($1) loop
    -- Get the current character
    if substring($1, i, 1) = '_' then
      -- If underscore, set the next character to uppercase
      next_upper := true;
    else
      -- If not underscore, append the character to the result
      if next_upper then
        result := result || upper(substring($1, i, 1));
        next_upper := false;
      else
        result := result || substring($1, i, 1);
      end if;
    end if;
  end loop;

  return result;
end;
$$ language plpgsql immutable;

commit;
