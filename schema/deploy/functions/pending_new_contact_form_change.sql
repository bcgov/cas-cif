-- Deploy cif:functions/pending_new_contact_form_change to pg

begin;

create function cif.pending_new_contact_form_change() returns cif.form_change as
$$
  select * from cif.form_change
  where form_data_table_name = 'contact'
  and form_data_schema_name = 'cif'
  and operation = 'INSERT'
  and change_status = 'pending'
  and created_by = (select id from cif.cif_user where uuid = (select sub from cif.session()))
  limit 1;
$$ language 'sql' stable;

comment on function cif.pending_new_contact_form_change() is
  'returns a form_change for a new contact in the pending state for the current user, i.e. allows to resume a contact creation';
commit;
