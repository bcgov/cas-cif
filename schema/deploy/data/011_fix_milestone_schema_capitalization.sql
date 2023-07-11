-- Deploy cif:data/011_fix_milestone_schema_capitalization to pg

begin;

create temporary table milestone (json_data jsonb);
\copy milestone(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/milestone.json | tr -d ''\n''';
with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('milestone', 'handle_milestone_form_change_commit', (select json_data from milestone), 'schema data relating to the milestone form and the reporting_requirement, milestone_report and payment tables')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
