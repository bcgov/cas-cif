-- Deploy cif:data/007_json_form_data_remove_default_undefined_operator to pg

create temporary table operator (json_data jsonb);
\copy operator(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/operator.json | tr -d ''\n''';;

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('operator', default, (select json_data from operator), 'schema data relating to the operator form and the operator table')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
