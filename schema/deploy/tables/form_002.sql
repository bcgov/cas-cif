-- Deploy cif:tables/form_002 to pg

begin;

alter table cif.form
alter column json_schema_generator type varchar(10000);

commit;
