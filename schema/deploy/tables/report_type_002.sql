-- Deploy cif:tables/report_type_002 to pg
-- requires: tables/report_type_001

begin;

update cif.report_type set is_milestone=false where name='Performance Milestone';

commit;
