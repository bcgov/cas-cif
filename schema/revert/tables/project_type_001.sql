-- Revert cif:tables/project_type_001 from pg

begin;

delete from cif.project_type where name = 'Methane Capture';

commit;
