begin;
select plan(8);


select has_role( 'cif_internal', 'role cif_internal exists' );
select isnt_superuser(
    'cif_internal',
    'cif_internal should not be a super user'
);

select has_role( 'cif_external', 'role cif_external exists' );
select isnt_superuser(
    'cif_external',
    'cif_external should not be a super user'
);

select has_role( 'cif_admin', 'role cif_admin exists' );
select isnt_superuser(
    'cif_admin',
    'cif_admin should not be a super user'
);

select has_role( 'cif_guest', 'role cif_guest exists' );
select isnt_superuser(
    'cif_guest',
    'cif_guest should not be a super user'
);


select finish();
rollback;
