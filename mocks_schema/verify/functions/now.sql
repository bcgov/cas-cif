-- Verify mocks:mock_now_method on pg

begin;

select pg_get_functiondef('mocks.now()'::regprocedure);

rollback;
