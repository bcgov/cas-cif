-- Revert cif:tables/funding_parameter_001 from pg

begin;

alter table cif.funding_parameter drop column proponent_cost;

commit;
