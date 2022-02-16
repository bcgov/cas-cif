-- Verify cif:mutations/create_form_change on pg

begin;

select pg_get_functiondef(
  (
    select
        oid FROM pg_proc
    where
        proname = 'create_form_change'
  )
);

rollback;
