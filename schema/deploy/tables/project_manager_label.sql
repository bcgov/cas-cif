-- Deploy cif:tables/project_manager_label to pg
-- requires: schemas/main

begin;

create table cif.project_manager_label (
  id integer primary key generated always as identity,
  label varchar(1000) not null unique
);

select cif_private.upsert_timestamp_columns('cif', 'project_manager_label');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_manager_label', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_manager_label', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_manager_label', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_manager_label', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.project_manager_label is 'Lookup table for project manager labels. Records define the labels that project managers can be assigned to a project as';
comment on column cif.project_manager_label.id is 'Unique ID for the project_manager_label record';
comment on column cif.project_manager_label.label is 'The label that project managers can be assigned to a project as';

insert into cif.project_manager_label (label)
values
  ('Tech Team Primary'),
  ('Tech Team Secondary'),
  ('Ops Team Primary'),
  ('Ops Team Secondary');

commit;
