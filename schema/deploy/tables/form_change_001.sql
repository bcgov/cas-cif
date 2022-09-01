-- Deploy cif:tables/form_change_001 to pg
-- requires: tables/form_change
-- requires: tables/form

begin;

alter table cif.form_change
add constraint form_change_json_schema_name_fkey foreign key (json_schema_name)
references cif.form (slug);

commit;
