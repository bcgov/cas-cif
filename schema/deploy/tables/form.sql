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

commit;
