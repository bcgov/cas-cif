-- Deploy cif:tables/funding_stream_rfp_project_status to pg
-- requires: tables/funding_stream_rfp
-- requires: tables/project_status

begin;

create table cif.funding_stream_rfp_project_status (
  id integer primary key generated always as identity,
  funding_stream_rfp_id int not null references cif.funding_stream_rfp(id),
  project_status_id int not null references cif.project_status(id)
);

create unique index fs_rfp_project_status_fs_rfp_id_project_status_id_uindex on cif.funding_stream_rfp_project_status(funding_stream_rfp_id, project_status_id);
create index fs_rfp_project_status_fs_rfp_id_fkey on cif.funding_stream_rfp_project_status(funding_stream_rfp_id);
create index fs_rfp_project_status_project_status_id_fkey on cif.funding_stream_rfp_project_status(project_status_id);

select cif_private.upsert_timestamp_columns('cif', 'funding_stream_rfp_project_status');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'funding_stream_rfp_project_status', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'funding_stream_rfp_project_status', 'cif_admin');
perform cif_private.grant_permissions('insert', 'funding_stream_rfp_project_status', 'cif_admin');
perform cif_private.grant_permissions('update', 'funding_stream_rfp_project_status', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions
end
$grant$;

comment on table cif.funding_stream_rfp_project_status is 'Defines which project states a funding_stream_rfp can be set to for a given year.';
comment on column cif.funding_stream_rfp_project_status.id is 'Primary key for funding_stream_rfp_project_status table';
comment on column cif.funding_stream_rfp_project_status.funding_stream_rfp_id is 'The id referencing the funding_stream_rfp table';
comment on column cif.funding_stream_rfp_project_status.project_status_id is 'The id refrencing the project_status table';

-- Insert all possible combinations of funding_stream_rfp to project_status
insert into cif.funding_stream_rfp_project_status (funding_stream_rfp_id, project_status_id)
    Select funding_stream_rfp.id, project_status.id
    from cif.funding_stream_rfp cross join cif.project_status;

commit;
