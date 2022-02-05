-- Deploy cif:trigger_functions/archived_records_are_immutable to pg

begin;

create or replace function cif_private.archived_records_are_immutable()
returns trigger as $$
begin
  if old.archived_at is not null then
    raise exception 'Deleted records cannot be modified';
  end if;
  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.archived_records_are_immutable to cif_internal, cif_external, cif_admin;

comment on function cif_private.archived_records_are_immutable()
  is $$
  A trigger that raises an exception if changes happen on a record where ''archived_at'' is set.
  $$;


commit;
