-- Revert mocks:schema_mocks from pg

begin;

drop schema mocks;

commit;
