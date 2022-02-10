-- Deploy cif:computed_columns/contact_pending_form_change to pg

begin;

create function cif.contact_pending_form_change(cif.contact) returns cif.form_change as $$
  select * from cif.form_change
  where form_data_schema_name = 'cif'
  and form_data_table_name = 'contact'
  and form_data_record_id = $1.id
  and change_status = 'pending';
$$ language sql stable;

comment on function cif.contact_pending_form_change(cif.contact) is 'Returns the pending form change editing the contact, if it exists.';

commit;
