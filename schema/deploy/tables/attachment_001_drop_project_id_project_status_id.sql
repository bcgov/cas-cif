-- Deploy cif:tables/attachment_001_drop_project_id_project_status_id.sql to pg
-- requires: tables/attachment

begin;

alter table cif.attachment drop column if exists project_id, drop column if exists project_status_id;

commit;
