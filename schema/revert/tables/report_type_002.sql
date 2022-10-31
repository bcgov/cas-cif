-- Revert cif:tables/report_type_002 from pg

begin;

update cif.report_type set is_milestone=true where name='Performance Milestone';

commit;
