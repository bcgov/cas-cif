-- Deploy cif:tables/attachment to pg
-- requires: tables/project_status
-- requires: tables/project
begin;

create table cif.attachment
(
  id integer primary key generated always as identity,
  file uuid,
  description varchar(10000),
  file_name varchar(1000),
  file_type varchar(100),
  file_size varchar(100),
  project_id integer not null references cif.project(id),
  project_status_id integer references cif.project_status(id)
);

select cif_private.upsert_timestamp_columns('cif', 'attachment');

create unique index attachment_file on cif.attachment(file);

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'attachment', 'cif_internal');
perform cif_private.grant_permissions('insert', 'attachment', 'cif_internal');
perform cif_private.grant_permissions('update', 'attachment', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'attachment', 'cif_admin');
perform cif_private.grant_permissions('insert', 'attachment', 'cif_admin');
perform cif_private.grant_permissions('update', 'attachment', 'cif_admin');

end
$grant$;

comment on table cif.attachment is 'Table containing information about uploaded attachments';
comment on column cif.attachment.id is 'Unique ID for the attachment';
comment on column cif.attachment.file is 'Universally Unique ID for the attachment, created by the fastapi storage micro-service';
comment on column cif.attachment.description is 'Description of the attachment';
comment on column cif.attachment.file_name is 'Original uploaded file name';
comment on column cif.attachment.file_type is 'Original uploaded file type';
comment on column cif.attachment.file_size is 'Original uploaded file size';
comment on column cif.attachment.project_id is 'The id of the project (cif.project.id) that the attachment was uploaded to';
comment on column cif.attachment.project_status_id is 'The id of the project_status (cif.project_status.id) that the attachment references';

commit;
