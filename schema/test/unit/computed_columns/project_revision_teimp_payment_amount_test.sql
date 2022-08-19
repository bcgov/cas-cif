

begin;

select plan(4);

-- mock functions
create or replace function cif.project_revision_teimp_payment_percentage(project_revision cif.project_revision)
  returns numeric as $$ select 75.0; $$ language sql stable;
create or replace function cif.project_revision_gross_payment_amount(project_revision cif.project_revision)
  returns numeric as $$ select 123600.78; $$ language sql stable;
create or replace function cif.project_revision_net_payment_amount(project_revision cif.project_revision)
  returns numeric as $$ select 123100.78; $$ language sql stable;

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');



select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_amount((select * from record))
  ),
  -- Test Case: 0.75 * (123600.78 - 100100.78) = 375
  375.0,
  'Should return the right calculation result according to the formula'
);

create or replace function cif.project_revision_teimp_payment_percentage(project_revision cif.project_revision)
  returns numeric as $$ select null::numeric; $$ language sql stable;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_amount((select * from record))
  ),
  null,
  'Should return null if the payment percentage is null'
);


create or replace function cif.project_revision_teimp_payment_percentage(project_revision cif.project_revision)
  returns numeric as $$ select 1::numeric; $$ language sql stable;
create or replace function cif.project_revision_gross_payment_amount(project_revision cif.project_revision)
  returns numeric as $$ select null::numeric; $$ language sql stable;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_amount((select * from record))
  ),
  null,
  'Should return null if the gross payment amount is null'
);

create or replace function cif.project_revision_gross_payment_amount(project_revision cif.project_revision)
  returns numeric as $$ select 1::numeric; $$ language sql stable;
create or replace function cif.project_revision_net_payment_amount(project_revision cif.project_revision)
  returns numeric as $$ select null::numeric; $$ language sql stable;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_amount((select * from record))
  ),
  null,
  'Should return null if the net payment amount is null'
);


select finish();

rollback;
