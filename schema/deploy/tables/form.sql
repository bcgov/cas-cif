-- Deploy cif:tables/form to pg
-- requires: schemas/main

begin;

create table cif.form(
  id integer primary key generated always as identity,
  slug varchar(1000) unique not null,
  json_schema jsonb not null,
  description varchar(10000) not null,
  json_schema_generator regprocedure,
  form_change_commit_handler regprocedure not null default 'cif_private.handle_default_form_change_commit(cif.form_change)'::regprocedure
);

select cif_private.upsert_timestamp_columns('cif', 'form');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'form', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'form', 'cif_admin');

end
$grant$;

comment on table cif.form is 'Table containing form handling data. It contains a schema for each front-end form and regprocedure function names to handle parsing the form_change data into tables.';
comment on column cif.form.id is 'Unique ID for the form data.';
comment on column cif.form.slug is 'Unique short name identifier for the json_schema data.';
comment on column cif.form.json_schema is 'The json_schema describing the shape of the form_change data for the corresponding form.';
comment on column cif.form.description is 'Metadata describing the json_schema.';
comment on column cif.form.json_schema_generator is 'A function that can be used to dynamically alter the schema, such as altering constraints based on the contents of a table.';
comment on column cif.form.form_change_commit_handler is 'A function that parses the form_change data into a table or set of tables.';

/** Insert data **/

/**
FLAT FORMS:
[x] ProjectForm: project
[x] ProjectContactForm: project_contact
[x] ProjectManagerForm: project_manager
[x] ProjectQuarterlyReportForm: reporting_requirement
[x] ProjectAnnualReportForm: reporting_requirement

[x] Contact: contact
[x] Operator: operator




MULTI:
[ ] ProjectEmissionIntensityReportForm: reporting_requirement, emission_intensity_report
[ ] ProjectFundingAgreementForm: funding_parameter, additional_funding_source
[ ] ProjectMilestoneReportForm: reporting_requirement, milestone_report, payment
**/

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


insert into cif.form(slug, json_schema, description)
values
('project', (select json_data from project), 'schema data relating to the project_overview form and the project table'),
('project_contact', (select json_data from project_contact), 'schema data relating to the project_contact form and the project_contact table'),
('project_manager', (select json_data from project_manager), 'schema data relating to the project_manager form and the project_manager table'),
('reporting_requirement', (select json_data from reporting_requirement), 'schema data relating to the quarterly report and annual report forms and the reporting_requirement table'),
('contact', (select json_data from contact), 'schema data relating to the contact form and the contact table'),
('operator', (select json_data from operator), 'schema data relating to the operator form and the operator table');

-- add a form_change_commit_handler once they are created for the below records
insert into cif.form(slug, json_schema, description)
values
('milestone', (select json_data from milestone), 'schema data relating to the milestone form and the reporting_requirement, milestone_report and payment tables');

commit;
