-- Deploy cif:tables/sector to pg
-- requires: schemas/main

begin;

create table cif.sector
(
  sector_name varchar(1000) primary key
);

select cif_private.upsert_timestamp_columns('cif', 'sector');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'sector', 'cif_internal');
perform cif_private.grant_permissions('insert', 'sector', 'cif_internal');
perform cif_private.grant_permissions('update', 'sector', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'sector', 'cif_admin');
perform cif_private.grant_permissions('insert', 'sector', 'cif_admin');
perform cif_private.grant_permissions('update', 'sector', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.sector is 'Lookup table for industry sectors used by the CleanBC Industry Fund';
comment on column cif.sector.sector_name is 'The name of the sector as the primary key';

insert into cif.sector (sector_name)
values
  ('Agriculture'),
  ('Cement'),
  ('Lime'),
  ('Refining Oil & Gas'),
  ('Midstream; Oil & Gas'),
  ('Upstream Oil & Gas'),
  ('Mining'),
  ('Pulp & Paper'),
  ('Utility');

commit;
