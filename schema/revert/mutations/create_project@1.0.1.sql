-- Deploy cif:mutations/create_project to pg
-- requires: tables/project

begin;

drop function cif.create_project;

commit;
