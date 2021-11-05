-- Deploy cif:schema/cif_private to pg

begin;

create schema cif_private;
grant usage on schema cif_private to cif_internal, cif_external, cif_admin;
comment on schema cif_private is 'The private schema for the cif application. It contains utility functions which should not be available directly through the API.';

commit;
