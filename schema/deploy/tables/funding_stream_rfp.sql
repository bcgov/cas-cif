-- Deploy cif:tables/funding_stream_rfp to pg
-- requires: tables/funding_stream

BEGIN;

create table cif.funding_stream_rfp(
  id integer primary key generated always as identity,
  year int not null,
  funding_stream_id integer not null references cif.funding_stream(id)
);

select cif_private.upsert_timestamp_columns('cif', 'funding_stream_rfp');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'funding_stream_rfp', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'funding_stream_rfp', 'cif_admin');
perform cif_private.grant_permissions('insert', 'funding_stream_rfp', 'cif_admin');
perform cif_private.grant_permissions('update', 'funding_stream_rfp', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.funding_stream_rfp is 'Table containing information about a CIF funding_stream_rfp';
comment on column cif.funding_stream_rfp.id is 'Unique ID for the funding_stream_rfp';
comment on column cif.funding_stream_rfp.year is 'The year this funding stream rfp is associated with';
comment on column cif.funding_stream_rfp.funding_stream_id is 'The id of the funding_stream (cif.funding_stream.id) this rfp year is associated with';

-- 2018 to 2022 is the MVP year range
insert into cif.funding_stream_rfp (year, funding_stream_id) values
(2019, 1), (2020, 1), (2021, 1), (2022, 1),
(2021, 2), (2022, 2);

COMMIT;
