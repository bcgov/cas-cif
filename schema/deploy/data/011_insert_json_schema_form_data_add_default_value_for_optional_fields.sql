-- Deploy cif:data/011_insert_json_schema_form_data_add_default_value_for_optional_fields to pg
-- requires: tables/form

begin;

--project
create temporary table project (json_data jsonb);
\copy project(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/project.json | tr -d ''\n''';
-- project_contact
create temporary table project_contact (json_data jsonb);
\copy project_contact(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/project_contact.json | tr -d ''\n''';
-- project_manager
create temporary table project_manager (json_data jsonb);
\copy project_manager(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/project_manager.json | tr -d ''\n''';
-- reporting_requirement (quarterly / annual report)
create temporary table reporting_requirement (json_data jsonb);
\copy reporting_requirement(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/reporting_requirement.json | tr -d ''\n''';
-- contact
create temporary table contact (json_data jsonb);
\copy contact(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/contact.json | tr -d ''\n''';
-- operator
create temporary table operator (json_data jsonb);
\copy operator(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/operator.json | tr -d ''\n''';
-- milestone
create temporary table milestone (json_data jsonb);
\copy milestone(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/milestone.json | tr -d ''\n''';
--- project_summary_report
create temporary table project_summary_report (json_data jsonb);
\copy project_summary_report(json_data) from program 'sed ''s/\\/\\\\/g'' < data/prod/json_schema/project_summary_report.json | tr -d ''\n''';

with rows as (
insert into cif.form(slug, form_change_commit_handler, json_schema, description)
values
('project', default, (select json_data from project), 'schema data relating to the project_overview form and the project table'),
('project_contact', default, (select json_data from project_contact), 'schema data relating to the project_contact form and the project_contact table'),
('project_manager', default, (select json_data from project_manager), 'schema data relating to the project_manager form and the project_manager table'),
('reporting_requirement', default, (select json_data from reporting_requirement), 'schema data relating to the quarterly report and annual report forms and the reporting_requirement table'),
('contact', default, (select json_data from contact), 'schema data relating to the contact form and the contact table'),
('operator', default, (select json_data from operator), 'schema data relating to the operator form and the operator table'),
('milestone', 'handle_milestone_form_change_commit', (select json_data from milestone), 'schema data relating to the milestone form and the reporting_requirement, milestone_report and payment tables'),
('project_summary_report', 'handle_project_summary_report_form_change_commit', (select json_data from project_summary_report), 'schema data relating to the project summary report')
on conflict(slug) do update
set json_schema=excluded.json_schema,
    description=excluded.description,
    json_schema_generator=excluded.json_schema_generator,
    form_change_commit_handler=excluded.form_change_commit_handler
returning 1
) select 'Inserted ' || count(*) || ' rows into cif.form' from rows;

commit;
