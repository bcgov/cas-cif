-- -- Deploy cif:functions/migration_funding_parameter_form_changes_to_single_form_change to pg

begin;

create or replace function cif_private.migration_funding_parameter_form_changes_to_single_form_change()
returns void as
$migration$

with
    sources as
        (
            select id, project_revision_id, new_form_data
            from cif.form_change
            where json_schema_name = 'additional_funding_source'
        ),
    aggregated_sources as
        (
            select project_revision_id, array_agg(
                json_build_object(
                    'source',(new_form_data ->> 'source'),
                    'amount',(new_form_data ->> 'amount')::int,
                    'status',(new_form_data ->> 'status')
                )
            ) as source
            from sources
            group by project_revision_id
        )
update cif.form_change
    set new_form_data = new_form_data ||
        jsonb_build_object(
        'additionalFundingSources',(
            select source
            from aggregated_sources
            where cif.form_change.project_revision_id=aggregated_sources.project_revision_id
            )
        )
    where form_data_table_name = 'funding_parameter'
    and (select source
        from aggregated_sources
        where cif.form_change.project_revision_id=aggregated_sources.project_revision_id) is not null;

select case
        when ((
            select sum((select jsonb_array_length((new_form_data->>'additionalFundingSources')::jsonb)))
            from cif.form_change)::int
            !=
            (select count(*)
            from cif.form_change
            where json_schema_name = 'additional_funding_source')::int
            )
        then
             cif_private.raise_exception('Some additional funding sources have not been correctly migrated'::text)
        else
            null
       end;

delete from cif.form_change
    where json_schema_name = 'additional_funding_source';

$migration$ language sql volatile;

comment on function cif_private.migration_funding_parameter_form_changes_to_single_form_change
  is $$
    A function used to move additional_funding_source form changes into the funding_parameter form changes.
  $$;

commit;
