-- Deploy cif:tables/project_attachment to pg
-- requires: tables/project
-- requires: tables/attachment

begin;

create table cif.project_attachment
(
  id integer primary key generated always as identity,
  project_id integer not null references cif.project(id),
  attachment_id integer not null references cif.attachment(id)
);

select cif_private.upsert_timestamp_columns('cif', 'project_attachment');

create unique index project_attachment_project_id_attachment_id_unique_index
  on cif.project_attachment (project_id, attachment_id)
  where archived_at is null;

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_attachment', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_attachment', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_attachment', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_attachment', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_attachment', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_attachment', 'cif_admin');

end
$grant$;

comment on table cif.project_attachment is 'Join table to track assignment of attachments to projects';
comment on column cif.project_attachment.id is 'Unique ID for the project attachment record';
comment on column cif.project_attachment.project_id is 'Foreign key to the project';
comment on column cif.project_attachment.attachment_id is 'Foreign key to the attachment';

commit;
