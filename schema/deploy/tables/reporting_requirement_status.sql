-- Deploy cif:tables/reporting_requirement_status to pg

begin;

create table cif.reporting_requirement_status (
  status varchar(1000) primary key,
  active boolean default true
);

select cif_private.upsert_timestamp_columns('cif', 'reporting_requirement_status');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'reporting_requirement_status', 'cif_internal');
perform cif_private.grant_permissions('insert', 'reporting_requirement_status', 'cif_internal');
perform cif_private.grant_permissions('update', 'reporting_requirement_status', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'reporting_requirement_status', 'cif_admin');
perform cif_private.grant_permissions('insert', 'reporting_requirement_status', 'cif_admin');
perform cif_private.grant_permissions('update', 'reporting_requirement_status', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.reporting_requirement_status is 'Table containing the different status that a reporting requirement can have';
comment on column cif.reporting_requirement_status.status is 'The name of the status, e.g. "pending", "committed", ...';
comment on column cif.reporting_requirement_status.active is 'Whether that status is active';

insert into cif.reporting_requirement_status (status)
values
  ('on_track'),
  ('late'),
  ('completed'),
  ('in_review');

commit;
