-- Deploy cif:tables/operator to pg
-- requires: schemas/main

begin;

create table cif.operator(
  id integer primary key generated always as identity,
  legal_name varchar(1000),
  trade_name varchar(1000),
  bc_registry_id varchar(100)
);

select cif_private.upsert_timestamp_columns('cif', 'operator');

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
comment on column cif.operator.legal_name is 'The legal name of this operator';
comment on column cif.operator.trade_name is 'The trade name of this operator';
comment on column cif.operator.bc_registry_id is 'The bc registry id assigned to this operator';

commit;
