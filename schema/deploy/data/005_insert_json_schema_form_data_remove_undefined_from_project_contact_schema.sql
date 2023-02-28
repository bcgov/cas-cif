-- Deploy cif:data/005_insert_json_schema_form_data_remove_undefined_from_project_contact_schema to pg

begin;


-- project_contact
create temporary table project_contact (json_data jsonb);
\copy project_contact(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/project_contact.json | tr -d ''\n''';;

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('project_contact', default, (select json_data from project_contact), 'schema data relating to the project_contact form and the project_contact table')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
