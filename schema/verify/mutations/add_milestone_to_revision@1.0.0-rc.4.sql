-- Verify cif:mutations/add_milestone_to_revision on pg

begin;

select pg_get_functiondef('cif.add_milestone_to_revision(int, int)'::regprocedure);

rollback;
