-- Deploy cif:project_revision_005_add_confirmed_column to pg


begin;

alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

alter table cif.project_revision
add column is_funding_stream_confirmed boolean not null default false;

alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

comment on column cif.project_revision.is_funding_stream_confirmed is 'A boolean to indicate whether the user has confirmed the RFP funding stream and year, in which case these fields are immutable';


commit;
