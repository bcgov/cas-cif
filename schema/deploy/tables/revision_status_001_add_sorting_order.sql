-- Deploy cif:tables/revision_status_001_add_sorting_order to pg
-- requires: tables/revision_status

begin;

alter table cif.revision_status add column sorting_order integer not null default 0;

update cif.revision_status set sorting_order = 1 where name in ('Pending Province Approval');
update cif.revision_status set sorting_order = 2 where name in ('Pending Proponent Signature');
update cif.revision_status set sorting_order = 3 where name in ('Applied');

comment on column cif.revision_status.sorting_order is 'Integer value to indicate the order in which the revision status should be displayed';

commit;
