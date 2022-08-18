-- Verify cif:data_migration/data_migration_add_general_revision on pg

begin;

select pg_get_functiondef('cif.add_general_revision()'::regprocedure);

rollback;
