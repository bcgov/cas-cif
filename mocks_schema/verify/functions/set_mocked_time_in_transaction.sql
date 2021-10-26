-- Verify mocks:set_mocked_time_in_transaction on pg

begin;

select pg_get_functiondef('mocks.set_mocked_time_in_transaction(timestamptz)'::regprocedure);

rollback;
