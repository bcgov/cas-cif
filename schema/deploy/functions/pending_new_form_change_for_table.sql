-- Deploy cif:functions/pending_new_form_change_for_table to pg

begin;

create or replace function cif.pending_new_form_change_for_table(table_name text) returns cif.form_change as
$$
  select * from cif.form_change
  where form_data_table_name = $1
  and form_data_schema_name = 'cif'
  and operation = 'create'
  and change_status = 'pending'
  and created_by = (select id from cif.cif_user where uuid = (select sub from cif.session()))
  order by created_at desc
  limit 1;
$$ language 'sql' stable;

comment on function cif.pending_new_form_change_for_table(text) is
  'returns a form_change for a table in the pending state for the current user, i.e. allows to resume the creation of any table row';
commit;
