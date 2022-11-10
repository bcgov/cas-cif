-- Deploy cif:tables/project_revision_amendment_type to pg
-- requires: tables/project_revision
-- requires: tables/amendment_type

begin;

create table cif.project_revision_amendment_type (
  id integer primary key generated always as identity,
  project_revision_id integer not null references cif.project_revision(id),
  amendment_type varchar(1000) not null references cif.amendment_type(name)
);

select cif_private.upsert_timestamp_columns('cif', 'project_revision_amendment_type');

create unique index project_revision_amendment_type_unique_index
  on cif.project_revision_amendment_type (project_revision_id, amendment_type)
  where archived_at is null;

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_revision_amendment_type', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_revision_amendment_type', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_revision_amendment_type', 'cif_internal');
perform cif_private.grant_permissions('delete', 'project_revision_amendment_type', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_revision_amendment_type', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_revision_amendment_type', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_revision_amendment_type', 'cif_admin');
perform cif_private.grant_permissions('delete', 'project_revision_amendment_type', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.project_revision_amendment_type is 'A join table between project revisions and amendment types.';
comment on column cif.project_revision_amendment_type.id is 'Unique ID for the project revision amendment type.';
comment on column cif.project_revision_amendment_type.project_revision_id is 'Foreign key to the project revision';
comment on column cif.project_revision_amendment_type.amendment_type is 'Foreign key to the amendment type';

commit;
