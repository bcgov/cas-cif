-- Deploy cif:tables/funding_parameter to pg

begin;

create table cif.funding_parameter(
  id integer primary key generated always as identity,
  project_id integer references cif.project(id) not null,
  total_project_value numeric(10,2),
  max_funding_amount numeric(10,2),
  province_share_percentage decimal(2,2),
  holdback_percentage decimal(2,2),
  anticipated_funding_amount numeric(10,2)
);

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

comment on table cif.funding_parameter is 'Table containing budget related data';
comment on column cif.funding_parameter.id is 'Unique ID for the budget data';
comment on column cif.funding_parameter.project_id is 'The related project for this data';
comment on column cif.funding_parameter.total_project_value is 'Total project value';
comment on column cif.funding_parameter.max_funding_amount is 'Maximum funding amount for this project';
comment on column cif.funding_parameter.province_share_percentage is 'Province share percentage';
comment on column cif.funding_parameter.holdback_percentage is 'Province holds back this percentage of funding';
comment on column cif.funding_parameter.anticipated_funding_amount is 'The anticipated funding amount';

commit;
