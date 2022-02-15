-- Deploy cif:trigger_functions/protect_manually_updated_operator_data to pg
-- requires: schemas/private

begin;

create or replace function cif_private.protect_manually_updated_operator_data()
returns trigger as $$
begin
  -- Check if legal_name has been updated by cif & do not update the value if true
  if (new.legal_name != old.legal_name and old.legal_name_updated_by_cif = true) then
    new.legal_name = old.legal_name;
  end if;
  -- Check if trade_name has been updated by cif & do not update the value if true
  if (new.trade_name != old.trade_name and old.trade_name_updated_by_cif = true) then
    new.trade_name = old.trade_name;
  end if;

  return new;
end;
$$ language plpgsql;

grant execute on function cif_private.protect_manually_updated_operator_data to cif_internal, cif_external, cif_admin;

comment on function cif_private.protect_manually_updated_operator_data()
  is $$
  A trigger that protects manually updated operator data (legal_name, trade_name) from being overwritten by automated upserts.
  $$;

commit;
