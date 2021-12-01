-- Deploy cif:tables/funding_stream to pg

BEGIN;

create table cif.funding_stream(
  id integer primary key generated always as identity,
  name varchar(1000) not null,
  description varchar(10000) not null
);

select cif_private.upsert_timestamp_columns('cif', 'funding_stream');
create unique index funding_stream_name on cif.funding_stream(name);

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'funding_stream', 'cif_internal');
perform cif_private.grant_permissions('insert', 'funding_stream', 'cif_internal');
perform cif_private.grant_permissions('update', 'funding_stream', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'funding_stream', 'cif_admin');
perform cif_private.grant_permissions('insert', 'funding_stream', 'cif_admin');
perform cif_private.grant_permissions('update', 'funding_stream', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.funding_stream is 'Table containing information about a CIF funding_stream';
comment on column cif.funding_stream.id is 'Unique ID for the funding_stream';
comment on column cif.funding_stream.name is 'Shortname of the funding stream program';
comment on column cif.funding_stream.description is 'Description of the funding_stream';

insert into cif.funding_stream (name, description) values ('EP', 'Emissions Performance'), ('IA', 'Innovation Accelerator');

COMMIT;
