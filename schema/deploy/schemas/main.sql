-- Deploy cif:schema/cif to pg

begin;

create schema cif;
grant usage on schema cif to cif_internal, cif_external, cif_admin, cif_guest;
comment on schema cif is 'The main schema for the cif application.';

commit;
