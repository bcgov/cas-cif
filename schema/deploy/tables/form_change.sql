-- Deploy cif:tables/audit to pg

begin;

create table cif.form_change (
  id integer primary key generated always as identity,
  new_form_data jsonb,
  operation varchar(1000),
  form_data_schema_name varchar(1000),
  form_data_table_name varchar(1000),
  form_data_record_id integer,
  project_revision_id integer references cif.project_revision(id),
  change_status varchar(1000) default 'pending' references cif.change_status,
  change_reason varchar(10000)
);

select cif_private.upsert_timestamp_columns('cif', 'form_change');

create trigger commit_form_change
    after insert or update of change_status on cif.form_change
    for each row
    when (new.change_status = 'committed')
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


comment on table cif.form_change is 'Table tracking individual changes to database records';
comment on column cif.form_change.id is 'Unique ID for the form_change';
comment on column cif.form_change.new_form_data is 'Unique ID for the form_change';
comment on column cif.form_change.operation is 'The SQL operation this form change describes: INSERT or UPDATE';
comment on column cif.form_change.form_data_schema_name is 'The schema on which this form change applies';
comment on column cif.form_change.form_data_table_name is 'The table on which this form change applies';
comment on column cif.form_change.form_data_record_id is 'The id of the record on which this form change applies';
comment on column cif.form_change.project_revision_id is 'The project revision this change might be associated with (if known)';
comment on column cif.form_change.change_status is 'The change status of this form change, foreign key to cif.change_status.';
comment on column cif.form_change.change_reason is 'The reason for the change';

commit;
