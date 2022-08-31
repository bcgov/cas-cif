-- Deploy cif:tables/revision_type to pg


begin;

create table cif.revision_type
(
  type varchar(1000) primary key
);

select cif_private.upsert_timestamp_columns('cif', 'revision_type');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'revision_type', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'revision_type', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.revision_type is 'Table containing information about revision types';
comment on column cif.revision_type.type is 'The type of the revision type as the primary key';


insert into cif.revision_type (type)
values
  ('Amendment'),
  ('General Revision'),
  ('Minor Revision');

commit;
