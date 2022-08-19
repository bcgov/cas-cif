-- Revert cif:data_migration/add_general_revision from pg

begin;

drop function cif.add_general_revision();

commit;
