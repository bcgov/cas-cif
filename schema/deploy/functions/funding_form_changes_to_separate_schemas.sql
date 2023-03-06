-- Deploy cif:functions/funding_form_changes_to_separate_schemas to pg

begin;

create or replace function cif_private.funding_form_changes_to_separate_schemas()
returns void as
$migration$

update cif.form_change
    set json_schema_name = 'funding_parameter_EP'
    where json_schema_name = 'funding_parameter'
    and project_revision_id in (
        with ep_projects_from_changes as (
            select * from cif.form_change
            where (new_form_data->>'fundingStreamRfpId')::numeric in ((select id from cif.funding_stream_rfp where funding_stream_id=(select id from cif.funding_stream where name='EP')))
            )
        select project_revision_id from ep_projects_from_changes
    );

update cif.form_change
    set json_schema_name = 'funding_parameter_IA'
    where json_schema_name = 'funding_parameter'
    and project_revision_id in (
        with ia_projects_from_changes as (
            select * from cif.form_change
            where (new_form_data->>'fundingStreamRfpId')::numeric in ((select id from cif.funding_stream_rfp where funding_stream_id=(select id from cif.funding_stream where name='IA')))
            )
        select project_revision_id from ia_projects_from_changes
    );

delete from cif.form where slug='funding_parameter';

$migration$ language sql volatile;

comment on function cif_private.funding_form_changes_to_separate_schemas
  is $$
    A function used to change a funding form change json_schema_name from the generic funding_parameter to funding_parameter_EP or funding_parameter_IA.
  $$;

commit;
