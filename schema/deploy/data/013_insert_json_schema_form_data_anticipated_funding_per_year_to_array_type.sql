-- Deploy cif:data/013_insert_json_schema_form_data_anticipated_funding_per_year_to_array_type to pg

begin;

-- funding_parameter_EP
create temporary table funding_parameter_EP (json_data jsonb);
\copy funding_parameter_EP(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/funding_parameter_EP.json | tr -d ''\n''';

-- funding_parameter_IA
create temporary table funding_parameter_IA (json_data jsonb);
\copy funding_parameter_IA(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/funding_parameter_IA.json | tr -d ''\n''';

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('funding_parameter_EP', 'handle_funding_parameter_form_change_commit', (select json_data from funding_parameter_EP), 'schema data relating to the funding_parameter_EP form and the funding_parameter and additional_funding_source tables'),
('funding_parameter_IA', 'handle_funding_parameter_form_change_commit', (select json_data from funding_parameter_IA), 'schema data relating to the funding_parameter_IA form and the funding_parameter and additional_funding_source tables')

on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
