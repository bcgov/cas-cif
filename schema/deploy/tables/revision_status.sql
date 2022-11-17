-- Deploy cif:tables/revision_status to pg
-- requires: tables/amendment_status

begin;

alter table cif.amendment_status rename to revision_status;
alter table cif.revision_status add column is_amendment_specific boolean;

update cif.revision_status set is_amendment_specific = false where name in ('Draft', 'Applied');
update cif.revision_status set is_amendment_specific = true where name not in ('Draft', 'Applied');

alter table cif.project_revision rename amendment_status to revision_status;



delete from cif.revision_status where name='Approved';

alter table cif.revision_status alter column is_amendment_specific set not null;

comment on column cif.revision_status.is_amendment_specific is 'Boolean value to indicate if the revision status can only be used for amendments';

commit;
