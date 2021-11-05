-- Revert cif:schema/cif from pg

begin;

drop schema cif;

commit;
