begin;
select plan(4);

select has_function(
  'cif', 'update_or_create_user_from_session',
  'Function update_or_create_user_from_session should exist'
);

-- Adds a user if the email doesn't exist in the system
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';
set jwt.claims.given_name to 'Bob';
set jwt.claims.family_name to 'Loblaw';
set jwt.claims.email to 'bob.loblaw@gov.bc.ca';

select cif.update_or_create_user_from_session();

select results_eq (
  $$
    select given_name, family_name, email_address
    from cif.cif_user
    where session_sub = '11111111-1111-1111-1111-111111111111'::varchar
  $$,
  $$
  values (
    'Bob'::varchar(1000),
    'Loblaw'::varchar(1000),
    'bob.loblaw@gov.bc.ca'::varchar(1000)
  )
  $$,
  'update_or_create_user_from_session() successfully creates a user when there are none in the system'
);

-- Updates the sub if the email already exists
set jwt.claims.sub to 'ABCDEF@provider';
set jwt.claims.given_name to 'Bob';
set jwt.claims.family_name to 'Loblaw';
set jwt.claims.email to 'bob.loblaw@gov.bc.ca';

select cif.update_or_create_user_from_session();

select results_eq (
  $$
    select given_name, family_name, email_address
    from cif.cif_user
    where session_sub = 'ABCDEF@provider'::varchar
  $$,
  $$
  values (
    'Bob'::varchar(1000),
    'Loblaw'::varchar(1000),
    'bob.loblaw@gov.bc.ca'::varchar(1000)
  )
  $$,
  'update_or_create_user_from_session() successfully updates the sub if the users already exists'
);

-- Throws if the sub already exists for a different email address

set jwt.claims.sub to 'ABCDEF@provider';
set jwt.claims.given_name to 'Bob';
set jwt.claims.family_name to 'Loblaw';
set jwt.claims.email to 'second.email@gov.bc.ca';

select throws_like (
  $$
    select cif.update_or_create_user_from_session();
  $$,
  '%duplicate key value violates unique constraint "cif_user_session_sub"',
  'update_or_create_user_from_session() throws if the sub already exists for a different email'
);

select finish();
rollback;
