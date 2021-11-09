-- Deploy cif:tables/audit to pg

begin;

create table cif.form_changes (
  id integer primary key generated always as identity,
  new_form_data jsonb,
  operation varchar(1000),
  form_data_schema_name varchar(1000),
  form_data_table_name varchar(1000),
  form_data_record_id integer,
  change_status varchar(1000) default 'pending',
  change_reason varchar(10000)
);

create trigger save_form_change
    after update of change_status on cif.form_changes
    for each row
    execute procedure cif_private.save_form_changes();

commit;
