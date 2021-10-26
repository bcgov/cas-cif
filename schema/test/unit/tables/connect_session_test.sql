begin;
select plan(2);

select has_table(
  'cif_private', 'connect_session',
  'cif_private.connect_session should exist, and be a table'
);

select has_index(
  'cif_private',
  'connect_session',
  'cif_private_idx_session_expire',
  'connect session has index: cif_private_idx_session_expire' );

select finish();
rollback;
