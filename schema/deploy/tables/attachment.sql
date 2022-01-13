-- Deploy cif:tables/attachment to pg

begin;

create table cif.attachment
(
  id integer primary key generated always as identity,
  file uuid,
  file_name varchar(1000)
);

select cif_private.upsert_timestamp_columns('cif', 'attachment');

create unique index attachment_file on cif.attachment(file);

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'attachment', 'cif_internal');
perform cif_private.grant_permissions('insert', 'attachment', 'cif_internal');
perform cif_private.grant_permissions('update', 'attachment', 'cif_admin',
  ARRAY['file', 'file_name']);

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'attachment', 'cif_admin');
perform cif_private.grant_permissions('insert', 'attachment', 'cif_admin');
perform cif_private.grant_permissions('update', 'attachment', 'cif_admin',
  ARRAY['file', 'file_name']);

end
$grant$;

comment on table cif.attachment is 'Table containing information about uploaded attachments';
comment on column cif.attachment.id is 'Unique ID for the attachment';
comment on column cif.attachment.file is 'Universally Unique ID for the attachment, created by the fastapi storage micro-service';
comment on column cif.attachment.file_name is 'Original uploaded filename';

commit;
