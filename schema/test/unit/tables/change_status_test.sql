begin;
select plan(1);

select results_eq(
  $$
    select status, triggers_commit, active from cif.change_status order by status
  $$,
  $$
    values
      ('committed'::varchar, true, true),
      ('pending'::varchar, false, true),
      ('staged'::varchar, false, true);
  $$,
  'cif.change_status contains the expected values'
);


select finish();
rollback;
