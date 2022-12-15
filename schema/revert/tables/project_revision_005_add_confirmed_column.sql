-- Revert cif:project_revision_005_add_confirmed_column from pg

begin;

alter table cif.project_revision drop column is_funding_stream_confirmed;

commit;
