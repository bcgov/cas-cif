-- Deploy cif:tables/project_manager to pg

begin;

create table cif.project_manager (
  id integer primary key generated always as identity,
  project_id integer not null references cif.project(id),
  cif_user_id integer not null references cif.cif_user(id),
  project_manager_label_id integer not null references cif.project_manager_label(id)
);

select cif_private.upsert_timestamp_columns('cif', 'project_manager');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'project_manager', 'cif_internal');
perform cif_private.grant_permissions('insert', 'project_manager', 'cif_internal');
perform cif_private.grant_permissions('update', 'project_manager', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'project_manager', 'cif_admin');
perform cif_private.grant_permissions('insert', 'project_manager', 'cif_admin');
perform cif_private.grant_permissions('update', 'project_manager', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.project_manager is 'Join table to track assignment of cif users to projects, as project managers';
comment on column cif.project_manager.id is 'Unique ID for the project manager record';
comment on column cif.project_manager.project_id is 'Foreign key to the project';
comment on column cif.project_manager.cif_user_id is 'Foreign key to the cif user';
comment on column cif.project_manager.project_manager_label_id is 'Foreign key to the project_manager_label table. Defines the list of labels that cif_users can be assigned to as a manager of a project';


commit;
