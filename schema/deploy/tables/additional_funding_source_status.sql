-- Deploy cif:tables/additional_funding_source_status to pg

begin;

create table cif.additional_funding_source_status
(
  status_name varchar(1000) primary key
);

select cif_private.upsert_timestamp_columns('cif', 'additional_funding_source_status');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'additional_funding_source_status', 'cif_internal');
perform cif_private.grant_permissions('insert', 'additional_funding_source_status', 'cif_internal');
perform cif_private.grant_permissions('update', 'additional_funding_source_status', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'additional_funding_source_status', 'cif_admin');
perform cif_private.grant_permissions('insert', 'additional_funding_source_status', 'cif_admin');
perform cif_private.grant_permissions('update', 'additional_funding_source_status', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.additional_funding_source_status is 'Lookup table for additional funding source statuses';
comment on column cif.additional_funding_source_status.status_name is 'The name of the status as the primary key';

insert into cif.additional_funding_source_status (status_name)
values
  ('Awaiting Approval'),
  ('Approved'),
  ('Denied');
commit;
