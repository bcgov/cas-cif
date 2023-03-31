-- Verify cif:mutations/add_additional_funding_source_to_revision on pg

begin;

select pg_get_functiondef('cif.add_additional_funding_source_to_revision(int, int)'::regprocedure);

rollback;
