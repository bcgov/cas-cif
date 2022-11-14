-- Revert cif:tables/project_revision_amendment_type from pg

begin;

drop table cif.project_revision_amendment_type;

commit;
