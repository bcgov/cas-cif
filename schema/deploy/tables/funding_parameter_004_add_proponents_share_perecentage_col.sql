-- Deploy cif:tables/funding_parameter_004_add_proponents_share_perecentage_col to pg
-- requires: tables/funding_parameter

begin;

alter table cif.funding_parameter
  add column proponents_share_percentage numeric;

comment on column cif.funding_parameter.proponents_share_percentage is 'calculated proponents share percentage';

commit;
