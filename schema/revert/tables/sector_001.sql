-- Revert cif:tables/sector_001 from pg

begin;

delete from cif.sector where sector_name in ('Waste', 'Manufacturing');

commit;
