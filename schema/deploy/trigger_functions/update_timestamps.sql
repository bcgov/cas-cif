-- Deploy cif:trigger_functions/update_timestamps to pg
-- requires: schemas/private

begin;

create or replace function cif_private.update_timestamps()
  returns trigger as $$

declare
  user_sub uuid;
  user_id int;

begin
  user_sub := (select sub from cif.session());
  user_id := (select id from cif.cif_user where cif_user.uuid = user_sub);
  if tg_op = 'INSERT' then
    if to_jsonb(new) ? 'created_at' then
      new.created_at = now();
      new.created_by = user_id;
    end if;
    if to_jsonb(new) ? 'updated_at' then
      new.updated_at = now();
      new.updated_by = user_id;
    end if;
  elsif tg_op = 'UPDATE' then
    if to_jsonb(new) ? 'deleted_at' then
      if old.deleted_at is distinct from new.deleted_at and new.deleted_at is not null then
        new.deleted_at = now();
        new.deleted_by = user_id;
      end if;
    end if;
    if to_jsonb(new) ? 'updated_at' then
      new.updated_at = greatest(now(), old.updated_at + interval '1 millisecond');
      new.updated_by = user_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.update_timestamps to cif_internal, cif_external, cif_admin;

comment on function cif_private.update_timestamps()
  is $$
  a trigger to set created_at and updated_at columns.
  example usage:

  create table some_schema.some_table (
    ...
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
  );
  create trigger _100_timestamps
    before insert or update on some_schema.some_table
    for each row
    execute procedure cif_private.update_timestamps();
  $$;

commit;
