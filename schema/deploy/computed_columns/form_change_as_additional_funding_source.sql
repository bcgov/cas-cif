-- Deploy cif:computed_columns/form_change_as_additional_funding_source to pg
-- requires: tables/project
-- requires: tables/additional_funding_source
-- requires: tables/form_change

begin;

create or replace function cif.form_change_as_additional_funding_source(cif.form_change)
returns cif.additional_funding_source
as $$
    select
      /**
        Given form_data_record_id can be null for some form_change records, it is not a reliable id value for the returned additional_funding_source record.
        The returned id must not be null, so we use the form_change id being passed in as a parameter (multiplied by -1 to ensure we are not touching any existing records).
        This means the id value is not going to be the correct id for the returned additional_funding_source record, which should be ok since we're only interested
        in the data in new_form_data.
      **/
      ($1.id * -1) as id,
      (new_form_data->>'projectId')::integer as project_id,
      new_form_data->>'status' as status,
      (new_form_data->>'source')::varchar as source,
      (new_form_data->>'amount')::numeric as amount,
      (new_form_data->>'sourceIndex')::integer as source_index,
      null::int as created_by,
      now()::timestamptz created_at,
      null::int as updated_by,
      now()::timestamptz updated_at,
      null::int as archived_by,
      null::timestamptz as archived_at
    from cif.form_change fc where fc.id = $1.id and fc.form_data_table_name = 'additional_funding_source'

$$ language sql stable;

comment on function cif.form_change_as_additional_funding_source(cif.form_change) is 'Computed column returns data from the new_form_data column as if it were an additional_funding_source record to allow graph traversal via the foreign keys.';

commit;
