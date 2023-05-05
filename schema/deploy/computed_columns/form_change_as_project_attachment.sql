-- Deploy cif:computed_columns/form_change_as_project_attachment to pg
-- requires: tables/attachment
-- requires: tables/form_change

begin;

create or replace function cif.form_change_as_project_attachment(cif.form_change)
returns cif.project_attachment
as $$
    select
      ($1.id * -1) as id,
      (new_form_data->>'projectId')::integer as project_id,
      (new_form_data->>'attachmentId')::integer as attachment_id,
      null::int as created_by,
      now()::timestamptz created_at,
      null::int as updated_by,
      now()::timestamptz updated_at,
      null::int as archived_by,
      null::timestamptz as archived_at
    from cif.form_change fc where fc.id = $1.id and fc.form_data_table_name = 'project_attachment'

$$ language sql stable;

comment on function cif.form_change_as_project_attachment(cif.form_change) is 'Computed column returns data from the new_form_data column as if it were an attachment record to allow graph traversal via the foreign keys.';

commit;
