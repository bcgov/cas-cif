-- Deploy cif:tables/funding_parameter_001 to pg

begin;

alter table cif.funding_parameter add column proponent_cost numeric;

comment on column cif.funding_parameter.proponent_cost is 'The funding provided by the proponent';

commit;
