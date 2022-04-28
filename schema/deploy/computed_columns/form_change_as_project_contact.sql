-- Deploy cif:computed_columns/form_change_as_project_contact to pg
-- requires: tables/project
-- requires: tables/contact
-- requires: tables/form_change

begin;

create or replace function cif.form_change_as_project_contact(cif.form_change)
returns cif.project_contact
as $$
    select
      /**
        Given form_data_record_id can be null for some form_change records, it is not a reliable id value for the returned project_contact record.
        The returned id must not be null, but we also don't want it to point to an actual project_contact record to avoid confusion for both relay and developers.
        The solution is to add 100 to the max id value for the project_contact table and use that as a stand-in id for the returned project record.
      **/
      (select max(id) + 100 from cif.project_contact) as id,
      (new_form_data->>'projectId')::integer as project_id,
      (new_form_data->>'contactId')::integer as contact_id,
      (new_form_data->>'contactIndex')::integer as contact_index,
      null::int as created_by,
      now()::timestamptz created_at,
      null::int as updated_by,
      now()::timestamptz updated_at,
      null::int as archived_by,
      null::timestamptz as archived_at
    from cif.form_change fc where fc.id = $1.id and fc.form_data_table_name = 'project_contact'

$$ language sql stable;

comment on function cif.form_change_as_project_contact(cif.form_change) is 'Computed column returns data from the new_form_data column as if it were a project_contact record to allow graph traversal via the foreign keys.';

commit;
