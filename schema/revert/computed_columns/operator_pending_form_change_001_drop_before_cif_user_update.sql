-- Revert cif:computed_columns/operator_pending_form_change_001_drop_before_cif_user_update from pg

begin;

create function cif.operator_pending_form_change(cif.operator) returns cif.form_change as $$
  select * from cif.form_change
  where form_data_schema_name = 'cif'
  and form_data_table_name = 'operator'
  and form_data_record_id = $1.id
  and change_status = 'pending'
  and created_by = (select id from cif.cif_user where uuid = (select sub from cif.session()));
$$ language sql stable;

comment on function cif.operator_pending_form_change(cif.operator) is 'Returns the pending form change editing the operator created by the current user, if it exists.';

commit;
