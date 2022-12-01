-- Verify cif:mutations/create_project_revision_002_pending_actions_from on pg

begin;

select pg_get_functiondef('cif.create_project_revision(integer, varchar(1000), varchar(1000)[], varchar(1000))'::regprocedure);

rollback;
