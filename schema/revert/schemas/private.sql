-- Revert cif:schema/cif_private from pg

begin;

drop schema cif_private;

commit;
