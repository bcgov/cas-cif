-- Revert cif:tables/project_type_002 from pg

begin;

delete from cif.project_type where name = 'Energy Efficiency';

commit;
