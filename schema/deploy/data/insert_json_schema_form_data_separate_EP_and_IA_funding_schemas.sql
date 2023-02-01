-- Deploy cif:data/insert_json_schema_form_data_separate_EP_and_IA_funding_schemas to pg

begin;

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
-- funding_parameter_IA and funding_parameter_EP to be removed when funding agreement form gets refactored to be one form change, just here to pass the fkey
('funding_parameter_EP', default, '{}'::jsonb, 'OBSOLETE (see comment above) schema data relating to funding_parameter_EP'),
('funding_parameter_IA', default, '{}'::jsonb, 'OBSOLETE (see comment above) schema data relating to funding_parameter_IA'),
-- brianna delete this once T's PR is in
('project_summary_report', default, '{}'::jsonb, 'OBSOLETE (see comment above) schema data relating to project_summary_report')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
