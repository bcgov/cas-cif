-- Deploy cif:tables/audit to pg

begin;

create table cif.form_change (
  id integer primary key generated always as identity,
  new_form_data jsonb,
  operation varchar(1000),
  form_data_schema_name varchar(1000),
  form_data_table_name varchar(1000),
  form_data_record_id integer,
  change_status varchar(1000) default 'pending' references cif.change_status,
  change_reason varchar(10000)
);

create trigger commit_form_change
    after insert or update of change_status on cif.form_change
    for each row
    execute procedure cif_private.commit_form_change();

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'form_change', 'cif_internal');
perform cif_private.grant_permissions('insert', 'form_change', 'cif_internal');
perform cif_private.grant_permissions('update', 'form_change', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'form_change', 'cif_admin');
perform cif_private.grant_permissions('insert', 'form_change', 'cif_admin');
perform cif_private.grant_permissions('update', 'form_change', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

commit;
