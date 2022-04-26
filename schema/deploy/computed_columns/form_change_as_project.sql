-- Deploy cif:computed_columns/form_change_as_project to pg
-- requires: tables/project
-- requires: tables/form_change

begin;

create or replace function cif.form_change_as_project(cif.form_change)
returns cif.project
as $$
  declare
    project_return cif.project;
  begin
    if ($1.form_data_table_name != 'project') then
      return null;
    end if;

    select
      form_data_record_id as id,
      (new_form_data->>'operatorId')::integer as operator_id,
      (new_form_data->>'fundingStreamRfpId')::integer as funding_stream_rfp_id,
      (new_form_data->>'projectStatusId')::integer as project_status_id,
      new_form_data->>'proposalReference' as proposal_reference,
      new_form_data->>'summary' as summary,
      new_form_data->>'projectName' as project_name,
      (new_form_data->>'totalFundingRequest')::numeric as total_funding_request
    from cif.form_change fc where fc.id = $1.id into project_return;

    return project_return;
  end;
$$ language plpgsql stable;

comment on function cif.contact_pending_form_change(cif.contact) is 'Computed column returns data from the new_form_data column as if it were a project to allow graph traversal via the foreign keys.';

commit;
