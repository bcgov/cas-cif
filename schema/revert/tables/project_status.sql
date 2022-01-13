-- Revert cif:tables/project_status from pg

BEGIN;

drop table cif.project_status;

COMMIT;
