-- Deploy cif:tables/project_revision to pg

begin;

create table cif.project_revision (
  id integer primary key generated always as identity,
  project_id integer references cif.project(id),
  change_status varchar(1000) default 'pending' references cif.change_status,
  change_reason varchar(10000),
  is_first_revision boolean default false
);

select cif_private.upsert_timestamp_columns('cif', 'project_revision', add_archive => false);


alter table cif.project_revision alter constraint project_revision_project_id_fkey deferrable;

create unique index project_revision_unique_pending_per_project_id on cif.project_revision (project_id, change_status)
  where change_status = 'pending';

-- We want the immutable trigger to run first to avoid doing unnecessary work
create trigger _100_committed_changes_are_immutable
    before update or delete on cif.project_revision
    for each row
    execute procedure cif_private.committed_changes_are_immutable();

create trigger commit_project_revision
    before insert or update of change_status on cif.project_revision
    for each row
    execute procedure cif_private.commit_project_revision();

do
$grant$
begin
-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_revision', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_revision', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_revision', 'cif_internal');
perform cif_private.grant_permissions('delete', 'project_revision', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_revision', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_revision', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_revision', 'cif_admin');
perform cif_private.grant_permissions('delete', 'project_revision', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions
end
$grant$;

comment on table cif.project_revision is 'Table containing all the changes for a project revision';
comment on column cif.project_revision.id is 'Unique ID for the project revision';
comment on column cif.project_revision.project_id is 'Foreign key to the associated project row. Will be null if the project hasn''t been committed yet.';
comment on column cif.project_revision.change_status is 'Foreign key to the status of the project revision';
comment on column cif.project_revision.change_reason is 'Explanation of why the revision was made';
comment on column cif.project_revision.is_first_revision is 'Boolean value to indicate if the revision is the first revision for the project';

commit;
