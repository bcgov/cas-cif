-- Deploy cif:tables/project_revision_001 to pg

begin;

alter table cif.project_revision add column revision_type varchar(1000) not null references cif.revision_type(type), add column comments varchar(10000);

comment on column cif.project_revision.revision_type is 'The type of the project revision (e.g. General Revision)';
comment on column cif.project_revision.comments is 'Comments on the project revision';

commit;
