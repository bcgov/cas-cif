-- Deploy cif:tables/revision_status to pg

begin;

alter table cif.amendment_status rename to revision_status;
alter table cif.revision_status add column is_amendment_specific boolean;

update cif.revision_status set is_amendment_specific = true where name='Draft' or name='Applied';
update cif.revision_status set is_amendment_specific = false where name not in('Draft', 'Applied');

alter table cif.project_revision rename amendment_status to revision_status;

alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;
update cif.project_revision set revision_status='Applied' where revision_status='Approved';
alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

delete from cif.revision_status where name='Approved';

alter table cif.revision_status alter column is_amendment_specific set not null;

commit;
