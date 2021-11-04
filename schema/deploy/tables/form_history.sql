-- Deploy cif:tables/audit to pg

begin;

create table cif.form_history (
  id integer primary key generated always as identity,
  old_form_data jsonb,
  new_form_data jsonb,
  query varchar(10000000),
  form_data_schema_name varchar(1000),
  form_data_table_name varchar(1000),
  form_data_record_id integer,
  change_status varchar(1000) default 'pending',
  change_reason varchar(10000)
);

create or replace function cif.audit_trigger() returns trigger as $$
declare
  old_data jsonb;
  new_data jsonb;
  existing_id integer;
begin
  
  existing_id := case when old is null then null else old.id end;

  insert into cif.form_history 
    (
      old_form_data, 
      new_form_data, 
      query, 
      form_data_schema_name, 
      form_data_table_name, 
      form_data_record_id, 
      change_status, 
      change_reason
    )
  values 
  (
    row_to_json(old.*) , 
    row_to_json(new)::jsonb - 'id',
    current_query(), 
    tg_table_schema, 
    tg_table_name, 
    existing_id, 
    'pending', 
    'audit_trigger inserted this row automatically'
  );

  return new;
end;
$$ language plpgsql;

create trigger project_audit before insert or update or delete on cif.project for each row execute procedure cif.audit_trigger();


create or replace function cif.form_history_apply_changes() returns trigger as $$
declare
  returned_id integer;
begin

  new.change_status := 'saved';

  execute new.query into returned_id;

  raise notice 'ID: %d', returned_id;

  -- RETRIEVE ID?

  return new;

end;
$$ language plpgsql;

create trigger apply_changes after insert on cif.form_history for each row execute procedure cif.form_history_apply_changes();

commit;
