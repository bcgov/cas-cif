-- Deploy cif:tables/project_revision to pg

begin;

create table cif.project_revision (
  id integer primary key generated always as identity,
  project_id integer,
  change_status varchar(1000) default 'pending' references cif.change_status
);

select cif_private.upsert_timestamp_columns('cif', 'project_revision');


do
$grant$
begin
-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_revision', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_revision', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_revision', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_revision', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_revision', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_revision', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions
end
$grant$;

comment on table cif.project_revision is 'Table containing all the changes for a project revision';
comment on column cif.project_revision.id is 'Unique ID for the project revision';
comment on column cif.project_revision.project_id is 'Foreign key to the associated project row. Will be null if the project hasn''t been committed yet.';
comment on column cif.project_revision.change_status is 'Foreign key to the status of the project revision';

commit;
