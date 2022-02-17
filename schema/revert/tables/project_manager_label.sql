-- Revert cif:tables/project_manager_label from pg

begin;

drop table cif.project_manager_label;

commit;
