-- Deploy cif:tables/cif_user to pg

begin;
create table cif.cif_user
(
  id integer primary key generated always as identity,
  uuid uuid not null,
  first_name varchar(1000),
  last_name varchar(1000),
  email_address varchar(1000)
);

select cif_private.upsert_timestamp_columns('cif', 'cif_user');

create unique index cif_user_uuid on cif.cif_user(uuid);
create unique index cif_user_email_address on cif.cif_user(email_address);

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'cif_user', 'cif_internal');
perform cif_private.grant_permissions('insert', 'cif_user', 'cif_internal');
perform cif_private.grant_permissions('update', 'cif_user', 'cif_internal',
  ARRAY['first_name', 'last_name', 'email_address', 'created_at', 'created_by', 'updated_at', 'updated_by', 'archived_at', 'archived_by']);

-- Grant cif_external permissions
perform cif_private.grant_permissions('select', 'cif_user', 'cif_external');
perform cif_private.grant_permissions('insert', 'cif_user', 'cif_external');
perform cif_private.grant_permissions('update', 'cif_user', 'cif_external',
  ARRAY['first_name', 'last_name', 'email_address', 'created_at', 'created_by', 'updated_at', 'updated_by', 'archived_at', 'archived_by']);

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'cif_user', 'cif_admin');
perform cif_private.grant_permissions('insert', 'cif_user', 'cif_admin');
perform cif_private.grant_permissions('update', 'cif_user', 'cif_admin',
  ARRAY['first_name', 'last_name', 'email_address', 'created_at', 'created_by', 'updated_at', 'updated_by', 'archived_at', 'archived_by']);


-- Grant cif_guest permissions
perform cif_private.grant_permissions('select', 'cif_user', 'cif_guest');

end
$grant$;

-- Enable row-level security
alter table cif.cif_user enable row level security;

do
$policy$
begin
-- cif_admin RLS
perform cif_private.upsert_policy('cif_admin_select_cif_user', 'cif_user', 'select', 'cif_admin', 'true');
perform cif_private.upsert_policy('cif_admin_insert_cif_user', 'cif_user', 'insert', 'cif_admin', 'true');
perform cif_private.upsert_policy('cif_admin_update_cif_user', 'cif_user', 'update', 'cif_admin', 'true');



-- cif_internal RLS: can see all users, but can only modify its own record
perform cif_private.upsert_policy('cif_internal_select_cif_user', 'cif_user', 'select', 'cif_internal', 'true');
perform cif_private.upsert_policy('cif_internal_insert_cif_user', 'cif_user', 'insert', 'cif_internal', 'uuid=(select sub from cif.session())');
perform cif_private.upsert_policy('cif_internal_update_cif_user', 'cif_user', 'update', 'cif_internal', 'uuid=(select sub from cif.session())');

-- cif_external RLS: can see all users, but can only modify its own record
perform cif_private.upsert_policy('cif_external_select_cif_user', 'cif_user', 'select', 'cif_external', 'true');
perform cif_private.upsert_policy('cif_external_insert_cif_user', 'cif_user', 'insert', 'cif_external', 'uuid=(select sub from cif.session())');
perform cif_private.upsert_policy('cif_external_update_cif_user', 'cif_user', 'update', 'cif_external', 'uuid=(select sub from cif.session())');


-- cif_guest RLS: can only see its own (empty) record
perform cif_private.upsert_policy('cif_guest_select_cif_user', 'cif_user', 'select', 'cif_guest', 'uuid=(select sub from cif.session())');

end
$policy$;

comment on table cif.cif_user is 'Table containing information about the application''s users ';
comment on column cif.cif_user.id is 'Unique ID for the user';
comment on column cif.cif_user.uuid is 'Universally Unique ID for the user, defined by the single sign-on provider';
comment on column cif.cif_user.first_name is 'User''s first name';
comment on column cif.cif_user.last_name is 'User''s last name';
comment on column cif.cif_user.email_address is 'User''s email address';

commit;
