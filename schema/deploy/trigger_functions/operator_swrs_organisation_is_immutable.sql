-- Deploy cif:trigger_functions/operator_swrs_organisation_is_immutable to pg

begin;

create or replace function cif_private.operator_swrs_organisation_is_immutable()
returns trigger as $$
begin
  raise exception 'The swrs_organisation_id cannot be changed';
end;
$$ language plpgsql;

grant execute on function cif_private.operator_swrs_organisation_is_immutable to cif_internal, cif_external, cif_admin;

comment on function cif_private.operator_swrs_organisation_is_immutable()
  is $$
    A trigger that raises an exception stating that the swrs_organisation_id cannot be changed.
  $$;


commit;
