-- Deploy cif:trigger_functions/set_project_long_id to pg
-- requires: schemas/private

begin;

create or replace function cif_private.set_project_long_id()
  returns trigger as $$

begin
  new.rfp_number := format(
    '%s-RFP-%s-%s-%s',
    (select year::text from cif.funding_stream_rfp where id = new.funding_stream_rfp_id),
    (select funding_stream_id::text from cif.funding_stream_rfp where id = new.funding_stream_rfp_id),
    new.rfp_number,
    (select operator_code from cif.operator where id = new.operator_id)
  );
  return new;
end;
$$ language plpgsql volatile;

grant execute on function cif_private.set_project_long_id to cif_internal,cif_external,cif_admin;

comment on function cif_private.set_project_long_id() is 'a trigger function to set the long id rfp_number by combining user input and derived values from the funding_stream_rfp and operator tables.';

commit;
