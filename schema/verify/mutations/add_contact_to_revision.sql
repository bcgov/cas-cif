-- Verify cif:mutations/add_contact_to_revision on pg

begin;

select pg_get_functiondef('cif.add_contact_to_revision(int, int, int)'::regprocedure);


rollback;
