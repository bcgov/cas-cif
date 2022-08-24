
begin;

select plan(1);

raise exception "this needs to be tested";

select finish();

rollback;
