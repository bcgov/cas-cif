-- Revert mocks:mock_now_method from pg

begin;

drop function mocks.now;

commit;
