-- Deploy cif:tables/project_001 to pg

begin;

alter table cif.project add column score numeric, add column project_type varchar(1000) references cif.project_type(name);

comment on column cif.project.score is 'The score of the project after evaluation by the CIF team';
comment on column cif.project.project_type is 'The type of the project (e.g. fuel switching)';

commit;
