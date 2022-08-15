-- Deploy cif:tables/project_type to pg

begin;

create table cif.project_type
(
  name varchar(1000) primary key
);

select cif_private.upsert_timestamp_columns('cif', 'project_type');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_type', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_type', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_type', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_type', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_type', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_type', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.project_type is 'Table containing information about project types';
comment on column cif.project_type.name is 'The name of the project type as the primary key';


insert into cif.project_type (name)
values
    ('Fuel Switching'),
    ('Waste Heat Recovery'),
    ('Renewable Energy'),
    ('Carbon Capture'),
    ('Utilization and Storage'),
    ('Methane Reduction'),
    ('Process Improvement'),
    ('Electrification'),
    ('Fleet Electrification'),
    ('Hydrogen Production/Blending'),
    ('Other');

commit;
