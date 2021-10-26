-- Revert mocks:set_mocked_time_in_transaction from pg

begin;

drop function mocks.set_mocked_time_in_transaction;

commit;
