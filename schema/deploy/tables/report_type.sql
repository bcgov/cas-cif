-- Deploy cif:tables/report_type to pg


begin;

create table cif.report_type
(
  id integer primary key generated always as identity,
  name varchar(1000) not null,
  form_schema jsonb
);


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
comment on column cif.report_type.id is 'Unique ID for the report type';
comment on column cif.report_type.name is 'The name of the report type';
comment on column cif.report_type.form_schema is 'The schema of the report type';


commit;
