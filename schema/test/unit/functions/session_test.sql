
begin;

select plan(4);

select has_function('cif', 'session', 'function cif.session exists');

select is((select sub from cif.session()), NULL, 'The session function should return null if jwt.claims.sub and jwt.claims.idir_userid are both null');

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';
select is((select sub from cif.session()), '11111111-1111-1111-1111-111111111111'::text, 'The session sub is determined by the jwt.claims.sub setting if the jwt.claims.idir_userid setting is not set');

set jwt.claims.idir_userid to '22222222-2222-2222-2222-222222222222';
select is((select sub from cif.session()), '22222222-2222-2222-2222-222222222222'::text, 'The session sub is determined by the jwt.claims.idir_userid setting if it exists');

select finish();

rollback;
