-- Deploy cif:computed_columns/form_change_as_project_contact to pg
-- requires: tables/project
-- requires: tables/contact
-- requires: tables/form_change

begin;

create or replace function cif.form_change_as_project_contact(cif.form_change)
returns cif.project_contact
as $$
    select
      form_data_record_id as id,
      (new_form_data->>'projectId')::integer as project_id,
      (new_form_data->>'contactId')::integer as contact_id,
      (new_form_data->>'contactIndex')::integer as contact_index,
      null::int as created_by,
      now()::timestamptz created_at,
      null::int as updated_by,
      now()::timestamptz updated_at,
      null::int as archived_by,
      null::timestamptz as archived_at
    from cif.form_change fc where fc.id = $1.id and fc.form_data_table_name = 'contact'

$$ language sql stable;

comment on function cif.contact_pending_form_change(cif.contact) is 'Computed column returns data from the new_form_data column as if it were a project_contact record to allow graph traversal via the foreign keys.';

commit;
