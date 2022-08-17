-- Deploy cif:tables/additional_funding_source to pg

begin;

create table cif.additional_funding_source (
  id integer primary key generated always as identity,
  project_id integer references cif.project(id) not null,
  status varchar(1000) references cif.additional_funding_source_status(status_name),
  source varchar(1000),
  amount numeric,
  source_index integer not null
);

select cif_private.upsert_timestamp_columns('cif', 'additional_funding_source');

create unique index additional_funding_source_project_id_unique_index
  on cif.additional_funding_source (project_id, source_index)
  where archived_at is null;

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'additional_funding_source', 'cif_internal');
perform cif_private.grant_permissions('insert', 'additional_funding_source', 'cif_internal');
perform cif_private.grant_permissions('update', 'additional_funding_source', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'additional_funding_source', 'cif_admin');
perform cif_private.grant_permissions('insert', 'additional_funding_source', 'cif_admin');
perform cif_private.grant_permissions('update', 'additional_funding_source', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.additional_funding_source is 'Table containing information about funding provided through sources other than CIF and the proponent; often needed for program review and data request purposes.';
comment on column cif.additional_funding_source.id is 'Unique ID for the additional funding source';
comment on column cif.additional_funding_source.project_id is 'Foreign key to the project';
comment on column cif.additional_funding_source.status is 'The status of the additional funding source request(e.g. awaiting approval, approved, denied)';
comment on column cif.additional_funding_source.source is 'The source of the additional funding source';
comment on column cif.additional_funding_source.amount is 'The amount of the additional funding source';
comment on column cif.additional_funding_source.source_index is 'The zero-based index of the source in the project';

commit;
