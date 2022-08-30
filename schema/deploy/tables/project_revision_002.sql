-- Deploy cif:tables/project_revision_002.sql to pg

begin;

alter table cif.project_revision add column amendment_status varchar(1000) references cif.amendment_status(name);

comment on column cif.project_revision.amendment_status is 'The status of the amendment of a project';

commit;
