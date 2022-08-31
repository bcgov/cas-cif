-- Deploy cif:tables/project_revision_001_add_revision_type to pg

begin;

alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

alter table cif.project_revision
add column revision_type varchar(1000) not null references cif.revision_type(type) default 'General Revision',
add column comments varchar(10000);

alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

comment on column cif.project_revision.revision_type is 'The type of the project revision (e.g. General Revision)';
comment on column cif.project_revision.comments is 'Comments on the project revision';

commit;
