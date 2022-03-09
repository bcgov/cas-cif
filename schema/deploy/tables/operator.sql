-- Deploy cif:tables/operator to pg
-- requires: schemas/main

begin;

create table cif.operator(
  id integer primary key generated always as identity,
  swrs_organisation_id integer unique,
  legal_name varchar(1000),
  trade_name varchar(1000),
  swrs_legal_name varchar(1000),
  swrs_trade_name varchar(1000),
  bc_registry_id varchar(100),
  operator_code varchar(10)
);

select cif_private.upsert_timestamp_columns('cif', 'operator');

create trigger swrs_organisation_id_is_immutable
  before update of swrs_organisation_id on cif.operator
  for each row
  when (new.swrs_organisation_id <> old.swrs_organisation_id)
  execute procedure cif_private.operator_swrs_organisation_is_immutable();

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'operator', 'cif_internal');
perform cif_private.grant_permissions('insert', 'operator', 'cif_internal');
perform cif_private.grant_permissions('update', 'operator', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'operator', 'cif_admin');
perform cif_private.grant_permissions('insert', 'operator', 'cif_admin');
perform cif_private.grant_permissions('update', 'operator', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.operator is 'Table containing information about a CIF operator';
comment on column cif.operator.id is 'Unique ID for the operator';
comment on column cif.operator.swrs_organisation_id is 'The organisation ID from the ggircs database as assigned by the federal Single Window Reporting System';
comment on column cif.operator.swrs_legal_name is 'The legal name of this operator as last imported from SWRS';
comment on column cif.operator.swrs_trade_name is 'The trade name of this operator as last imported from SWRS';
comment on column cif.operator.legal_name is 'The legal name of this operator';
comment on column cif.operator.trade_name is 'The trade name of this operator';
comment on column cif.operator.bc_registry_id is 'The bc registry id assigned to this operator';
comment on column cif.operator.operator_code is 'The operator code is a set of characters that uniquely identifies the operator and is used in the cif.project table as part of the rfp_number';

commit;
