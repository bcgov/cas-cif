-- Revert cif:data_migration/data_migration_add_general_revision from pg

begin;

drop function cif.add_general_revision();

commit;
