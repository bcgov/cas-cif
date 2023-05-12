-- Revert cif:tables/attachment_001_drop_project_id_project_status_id.sql from pg

begin;

alter table cif.attachment add column if not exists project_id integer references cif.project(id);
alter table cif.attachment add column if not exists project_status_id integer references cif.project_status(id);

commit;
