-- Deploy cif:tables/amendment_type to pg

begin;

create table cif.amendment_type
(
  name varchar(1000) primary key
);

select cif_private.upsert_timestamp_columns('cif', 'amendment_type');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'amendment_type', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'amendment_type', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.amendment_type is 'Lookup table for amendment types';
comment on column cif.amendment_type.name is 'The name of the amendment type as the primary key';

insert into cif.amendment_type (name)
values
  ('Schedule'),
  ('Scope'),
  ('Cost');
commit;
