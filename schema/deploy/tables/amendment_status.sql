-- Deploy cif:tables/amendment_status to pg

begin;

create table cif.amendment_status
(
  name varchar(1000) primary key
);

select cif_private.upsert_timestamp_columns('cif', 'amendment_status');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'amendment_status', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'amendment_status', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.amendment_status is 'Table containing information about amendment statuses';
comment on column cif.amendment_status.name is 'The name of the amendment status as the primary key';


insert into cif.amendment_status (name)
values
  ('In Discussion'),
  ('Pending Province Approval'),
  ('Pending Proponent Signature'),
  ('Approved'),
  ('Draft'),
  ('Applied');

commit;
