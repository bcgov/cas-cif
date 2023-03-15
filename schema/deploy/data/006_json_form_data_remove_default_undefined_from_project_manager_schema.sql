-- Deploy cif:data/006_json_schema_project_manager_form_remove_default to pg

create temporary table project_manager (json_data jsonb);
\copy project_manager(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/project_manager.json | tr -d ''\n''';;

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('project_manager', default, (select json_data from project_manager), 'schema data relating to the project_manager form and the project_manager table')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
