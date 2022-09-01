-- Revert cif:tables/form_change_001 from pg

begin;

alter table cif.form_change
drop constraint form_change_json_schema_name_fkey;

commit;
