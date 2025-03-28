-- Deploy cif:tables/project_revision_003_set_amendment_statuses to pg

begin;

alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

alter table cif.project_revision rename amendment_status to revision_status;
alter table cif.project_revision alter column revision_status set default 'Draft';

update cif.project_revision
set revision_status =
(case
      when (revision_status='Approved')
        then 'Applied'
      when
        (change_status='pending') or
        (change_status='staged')
        then 'Draft'
    else 'Applied'
    end);

alter table cif.project_revision alter column revision_status set not null;

alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

comment on column cif.project_revision.revision_type is 'The type of the project revision (e.g. General Revision)';
comment on column cif.project_revision.comments is 'Comments on the project revision';
comment on column cif.project_revision.revision_status is 'The status of the revision of a project';

commit;
