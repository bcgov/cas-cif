-- Deploy cif:tables/project_contact to pg

begin;

create table cif.project_contact (
  id integer primary key generated always as identity,
  project_id integer not null references cif.project(id),
  contact_id integer not null references cif.contact(id),
  contact_index integer not null
);

create unique index project_contact_project_id_contact_id_unique_index on cif.project_contact (project_id, contact_index);
select cif_private.upsert_timestamp_columns('cif', 'project_contact');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_contact', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_contact', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_contact', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_contact', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_contact', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_contact', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.project_contact is 'Join table to track assignment of contacts to projects';
comment on column cif.project_contact.id is 'Unique ID for the project contact record';
comment on column cif.project_contact.project_id is 'Foreign key to the project';
comment on column cif.project_contact.contact_id is 'Foreign key to the contact';
comment on column cif.project_contact.contact_index is 'The zero-based index of the contact in the project';

commit;
