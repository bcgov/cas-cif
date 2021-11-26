-- Revert cif:tables/attachment from pg

BEGIN;

drop table cif.attachment;

COMMIT;
