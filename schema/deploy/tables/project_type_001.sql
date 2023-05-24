-- Deploy cif:tables/project_type_001 to pg

begin;

insert into cif.project_type (name)
values
  ('Methane Capture');

commit;
