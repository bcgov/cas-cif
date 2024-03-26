-- Deploy cif:functions/jsonb_minus to pg

begin;
-- A note on the functionality:
-- If a key is present in the subtrahend but not the minuend, it will not appear in the result set.
-- {"a": 1, "b": 3} - {"a": 1, "b": 2, "c": 3} =  {"b": 3}
-- If however a key is present in the minuend but not the subtrahend, it will appear in the result set with its value.
-- {"a": 1, "b": 3, "c": 3} - {"a": 1, "b": 2} =  {"b": 3, "c": 3}

-- This behaviour fits our needs at the time of writing this, so the additional complexity of handling the other cases is not needed.


create or replace function cif.jsonb_minus(minuend jsonb, subtrahend jsonb)
  returns jsonb as
$$
declare
  difference jsonb;
begin
    select jsonb_object_agg(key, value) into strict difference
    from (
        select * from jsonb_each($1)
        except select * from jsonb_each($2)
    ) as temp;

    return difference;
end
$$ language plpgsql volatile;

comment on function cif.pending_new_form_change_for_table(text) is
  'returns list of key-value pairs present in the first argument but not the second argument';
commit;
