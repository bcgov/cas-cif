-- Deploy cif:trigger_functions/operator_data_manually_updated to pg
-- requires: schemas/private

begin;

create or replace function cif_private.operator_data_manually_updated()
returns trigger as $$
begin
  -- Check if legal_name has been updated
  if (new.legal_name != old.legal_name) then
    new.legal_name_updated_by_cif = true;
  end if;
  -- Check if trade_name has been updated
  if (new.trade_name != old.trade_name) then
    new.trade_name_updated_by_cif = true;
  end if;

  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.operator_data_manually_updated to cif_internal, cif_external, cif_admin;

comment on function cif_private.operator_data_manually_updated()
  is $$
  A trigger that sets the boolean values legal_name_updated_by_cif and trade_name_updated_by_cif if legal_name or trade_name is manually updated by a cif user.
  $$;

commit;
