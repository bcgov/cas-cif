-- Deploy cif:data/010_insert_json_schema_form_data_refactor_emission_schema to pg

begin;

delete from cif.form where slug='emission_intensity_report';
delete from cif.form where slug='emission_intensity_reporting_requirement';

-- milestone
create temporary table emission_intensity (json_data jsonb);
\copy emission_intensity(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/emission_intensity.json | tr -d ''\n''';

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('emission_intensity', 'handle_emission_intensity_form_change_commit', (select json_data from emission_intensity), 'schema data relating to the reporting_requirement and emission_intensity_report form  tables')

on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
