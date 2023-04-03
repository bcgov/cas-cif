-- Revert cif:tables/revision_status_001_add_sorting_order from pg

begin;

alter table cif.revision_status drop column sorting_order;

commit;
