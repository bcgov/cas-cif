-- Deploy cif:tables/funding_parameter to pg

begin;

create table cif.funding_parameter(
  id integer primary key generated always as identity,
  project_id integer references cif.project(id) not null,
  total_project_value numeric(20,2),
  max_funding_amount numeric(20,2),
  province_share_percentage numeric,
  holdback_percentage numeric,
  anticipated_funding_amount numeric(20,2)
);

select cif_private.upsert_timestamp_columns('cif', 'funding_parameter');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'funding_parameter', 'cif_internal');
perform cif_private.grant_permissions('insert', 'funding_parameter', 'cif_internal');
perform cif_private.grant_permissions('update', 'funding_parameter', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'funding_parameter', 'cif_admin');
perform cif_private.grant_permissions('insert', 'funding_parameter', 'cif_admin');
perform cif_private.grant_permissions('update', 'funding_parameter', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.funding_parameter is 'Table containing funding agreement data';
comment on column cif.funding_parameter.id is 'Unique ID for the funding agreement data';
comment on column cif.funding_parameter.project_id is 'The related project for this data';
comment on column cif.funding_parameter.total_project_value is 'Total project value';
comment on column cif.funding_parameter.max_funding_amount is 'Maximum funding amount for this project';
comment on column cif.funding_parameter.province_share_percentage is 'The percent of the total funding for a project that the Province is providing';
comment on column cif.funding_parameter.holdback_percentage is 'The designated holdback percentage for each payment. CIF holds back this designated holdback percentage from each payment, and the cumulated holdback amount is the total possible value of the final (performance) milestone payment. The proponent is paid a portion of this possible total based on their project emission intensity performance relative to the target emission intensity';
comment on column cif.funding_parameter.anticipated_funding_amount is 'Total anticipated funding amount inserted by CIF users';

commit;
