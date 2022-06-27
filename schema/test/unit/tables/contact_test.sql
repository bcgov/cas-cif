begin;
select plan(26);

select has_table('cif', 'contact', 'table cif.contact exists');
select has_column('cif', 'contact', 'id', 'table cif.contact has id column');
select has_column('cif', 'contact', 'given_name', 'table cif.contact has given_name column');
select has_column('cif', 'contact', 'family_name', 'table cif.contact has family_name column');
select has_column('cif', 'contact', 'email', 'table cif.contact has email column');
select has_column('cif', 'contact', 'phone', 'table cif.contact has phone column');
select has_column('cif', 'contact', 'phone_ext', 'table cif.contact has phone_ext column');
select has_column('cif', 'contact', 'company_name', 'table cif.contact has company_name column');
select has_column('cif', 'contact', 'contact_position', 'table cif.contact has contact_position column');
select has_column('cif', 'contact', 'comments', 'table cif.contact has comments column');
select has_column('cif', 'contact', 'created_at', 'table cif.contact has created_at column');
select has_column('cif', 'contact', 'updated_at', 'table cif.contact has updated_at column');
select has_column('cif', 'contact', 'archived_at', 'table cif.contact has archived_at column');
select has_column('cif', 'contact', 'created_by', 'table cif.contact has created_by column');
select has_column('cif', 'contact', 'updated_by', 'table cif.contact has updated_by column');
select has_column('cif', 'contact', 'archived_by', 'table cif.contact has archived_by column');


insert into cif.contact
  (given_name, family_name, email, phone, phone_ext, contact_position, comments) values
  ('bob', 'loblaw', 'bob@loblaw', '+11234567890', '123', 'lawyer', 'bob loblaw no habla espanol');

-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.contact
  $$,
    'cif_admin can view all data in contact table'
);

select lives_ok(
  $$
    insert into cif.contact(given_name, family_name, email) values ('foo4', 'bar4', 'foo@bar');
  $$,
    'cif_admin can insert data in contact table'
);

select lives_ok(
  $$
    update cif.contact set given_name = 'changed_by_admin' where given_name='foo4';
  $$,
    'cif_admin can change data in contact table'
);

select results_eq(
  $$
    select count(id) from cif.contact where given_name = 'changed_by_admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    insert into cif.contact(given_name, family_name, email, phone, phone_ext, contact_position, comments) values
  ('should', 'error', 'bob@loblaw', '+11234567890', '123', 'lawyer', 'dup email should throw');
  $$,
  'duplicate key value violates unique constraint "contact_email_key"',
    'Contact email must be unique'
);

select throws_like(
  $$
    delete from cif.contact where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table contact'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.contact
  $$,
  ARRAY['2'::bigint],
    'cif_internal can view all data from contact'
);

select lives_ok(
  $$
    update cif.contact set given_name = 'changed_by_internal' where given_name='changed_by_admin';
  $$,
    'cif_internal can update data in the contact table'
);

select results_eq(
  $$
    select given_name from cif.contact where given_name = 'changed_by_internal';
  $$,
  ARRAY['changed_by_internal'::varchar(1000)],
    'Data was changed by cif_internal'
);

select throws_like(
  $$
    delete from cif.contact where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_contact'
);

select finish();
rollback;
