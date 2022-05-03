-- Deploy cif:tables/report_type to pg


begin;

create table cif.report_type
(
  name varchar(1000) primary key
);

select cif_private.upsert_timestamp_columns('cif', 'report_type');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'report_type', 'cif_internal');
perform cif_private.grant_permissions('insert', 'report_type', 'cif_internal');
perform cif_private.grant_permissions('update', 'report_type', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'report_type', 'cif_admin');
perform cif_private.grant_permissions('insert', 'report_type', 'cif_admin');
perform cif_private.grant_permissions('update', 'report_type', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.report_type is 'Table containing information about report types';
comment on column cif.report_type.name is 'The name of the report type as the primary key';

insert into cif.report_type (name)
values
  ('Quarterly'),
  ('Annual'),
  ('General Milestone'),
  ('Advanced Milestone'),
  ('Performance Milestone'),
  ('Reporting Milestone');

commit;
