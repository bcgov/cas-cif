-- Deploy cif:data/002_insert_json_schema_form_data_remove_default_from_annual_report_schema to pg

begin;

-- reporting_requirement (quarterly / annual report)
create temporary table reporting_requirement (json_data jsonb);
\copy reporting_requirement(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/reporting_requirement.json | tr -d ''\n''';

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('reporting_requirement', default, (select json_data from reporting_requirement), 'schema data relating to the quarterly report and annual report forms and the reporting_requirement table')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
