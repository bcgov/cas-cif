-- Deploy cif:trigger_functions/funding_stream_is_immutable to pg

begin;

create or replace function cif_private.funding_stream_is_immutable()
returns trigger as $$
begin
  if new.funding_stream_rfp_id != old.funding_stream_rfp_id then
    raise exception 'Funding stream rfp id is immutable';
  end if;
  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.funding_stream_is_immutable to cif_internal, cif_external, cif_admin;

comment on function cif_private.funding_stream_is_immutable()
  is $$
  A trigger that raises an exception if changes happen to funding stream after a proejct has been created.
  $$;


commit;
