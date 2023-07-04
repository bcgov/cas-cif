-- Deploy cif:tables/project_type_002 to pg

begin;

insert into cif.project_type (name)
values
  ('Energy Efficiency');

commit;
