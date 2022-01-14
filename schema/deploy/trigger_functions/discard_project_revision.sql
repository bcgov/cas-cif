-- Deploy cif:trigger_functions/discard_project_revision to pg

begin;

create or replace function cif_private.discard_project_revision()
returns trigger as $$
declare
begin
  update cif.form_change
    set deleted_at = now()
    where project_revision_id=new.id
    and deleted_at is null;

  return new;
end;
$$ language plpgsql;

commit;
