-- Deploy cif:data/insert_json_schema_form_data_project_summary to pg

begin;

--- project_summary_report
create temporary table project_summary_report (json_data jsonb);
\copy project_summary_report(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/project_summary_report.json | tr -d ''\n''';

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('project_summary_report', 'handle_project_summary_report_form_change_commit', (select json_data from project_summary_report), 'schema data relating to the project summary report')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
