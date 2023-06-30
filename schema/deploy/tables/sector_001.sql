-- Deploy cif:tables/sector_001 to pg

begin;

insert into cif.sector (sector_name)
values
    ('Waste'),
    ('Manufacturing');

commit;
