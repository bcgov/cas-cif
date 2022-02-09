-- Deploy cif:trigger_functions/committed_changes_are_immutable to pg

begin;

create or replace function cif_private.committed_changes_are_immutable()
returns trigger as $$
begin
  if (select triggers_commit from cif.change_status where status=old.change_status) then
    raise exception 'Committed records cannot be modified';
  end if;
  if (TG_OP='DELETE') then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql;

grant execute on function cif_private.committed_changes_are_immutable to cif_internal, cif_external, cif_admin;

comment on function cif_private.committed_changes_are_immutable()
  is $$
  A trigger that raises an exception if changes happen on a record where the change_status triggers a commit.
  $$;


commit;
