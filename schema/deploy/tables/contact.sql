-- Deploy cif:tables/contact to pg

begin;

create table cif.contact(
  id integer primary key generated always as identity,
  given_name varchar(1000),
  family_name varchar(1000),
  email varchar(1000),
  phone varchar(100) constraint e164_format check (phone ~ '^\+\d{1,15}$'),
  phone_ext varchar(100),
  company_name varchar(1000),
  contact_position varchar(1000),
  comments varchar(10000)
);

select cif_private.upsert_timestamp_columns('cif', 'contact');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'contact', 'cif_internal');
perform cif_private.grant_permissions('insert', 'contact', 'cif_internal');
perform cif_private.grant_permissions('update', 'contact', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'contact', 'cif_admin');
perform cif_private.grant_permissions('insert', 'contact', 'cif_admin');
perform cif_private.grant_permissions('update', 'contact', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.contact is 'Table containing information about a CIF contact';
comment on column cif.contact.id is 'Unique ID for the contact';
comment on column cif.contact.given_name is 'The given name of this contact';
comment on column cif.contact.family_name is 'The family name of this contact';
comment on column cif.contact.email is 'The email address of this contact';
comment on column cif.contact.phone is 'The phone number of this contact, stored in E.164 format';
comment on column cif.contact.phone_ext is 'The phone extension of this contact';
comment on column cif.contact.company_name is 'The company this contact works for';
comment on column cif.contact.contact_position is 'The role of this contact within their company';
comment on column cif.contact.comments is 'Any comments about this contact';

commit;
