-- Deploy cif:tables/project to pg

begin;

create table cif.project(
  id integer primary key generated always as identity,
  cif_identifier integer unique not null,
  description varchar(10000) not null,
  funding_stream_id int not null references cif.funding_stream(id)
);

select cif_private.upsert_timestamp_columns('cif', 'project');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project', 'cif_internal');
perform cif_private.grant_permissions('update', 'project', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project', 'cif_admin');
perform cif_private.grant_permissions('update', 'project', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.project is 'Table containing information about a CIF Project';
comment on column cif.project.id is 'Unique ID for the project';
comment on column cif.project.cif_identifier is 'Unique numeric identifier internal to the CIF team';
comment on column cif.project.description is 'Description of the project';
comment on column cif.project.funding_stream_id is 'The id of the funding_stream (cif.funding_stream.id) that was selected when creating the project';

commit;
