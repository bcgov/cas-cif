-- Deploy cif:computed_columns/form_change_as_project to pg
-- requires: tables/project
-- requires: tables/form_change

begin;

create or replace function cif.form_change_as_project(cif.form_change)
returns cif.project
as $$
    select
      form_data_record_id as id,
      (new_form_data->>'operatorId')::integer as operator_id,
      (new_form_data->>'fundingStreamRfpId')::integer as funding_stream_rfp_id,
      (new_form_data->>'projectStatusId')::integer as project_status_id,
      new_form_data->>'proposalReference' as proposal_reference,
      new_form_data->>'summary' as summary,
      new_form_data->>'projectName' as project_name,
      (new_form_data->>'totalFundingRequest')::numeric as total_funding_request,
      null::int as created_by,
      now()::timestamptz created_at,
      null::int as updated_by,
      now()::timestamptz updated_at,
      null::int as archived_by,
      null::timestamptz as archived_at
    from cif.form_change fc where fc.id = $1.id and fc.form_data_table_name = 'project'

$$ language sql stable;

comment on function cif.contact_pending_form_change(cif.contact) is 'Computed column returns data from the new_form_data column as if it were a project to allow graph traversal via the foreign keys.';

commit;
