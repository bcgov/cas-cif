begin;
select plan(2);

select has_function(
  'cif', 'create_user_from_session',
  'Function create_user_from_session should exist'
);

-- Add a user via create_user_from_session()
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';
set jwt.claims.given_name to 'Bob';
set jwt.claims.family_name to 'Loblaw';
set jwt.claims.email to 'bob.loblaw@gov.bc.ca';

select cif.create_user_from_session();

select results_eq (
  $$
    select given_name, family_name, email_address, session_sub
    from cif.cif_user
    where session_sub = '11111111-1111-1111-1111-111111111111'::varchar
  $$,
  $$
  values (
    'Bob'::varchar(1000),
    'Loblaw'::varchar(1000),
    'bob.loblaw@gov.bc.ca'::varchar(1000),
    '11111111-1111-1111-1111-111111111111'::varchar
  )
  $$,
  'create_user_from_session() successfully creates a user'
);

select finish();
rollback;
