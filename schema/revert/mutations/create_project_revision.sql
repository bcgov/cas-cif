-- Deploy cif:mutations/create_project_revision to pg

begin;

drop function cif.create_project_revision(integer, varchar(1000));

commit;
