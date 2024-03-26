

begin;

select plan(2);

/** SETUP **/
truncate cif.form_change restart identity;

create or replace function cif_private.commit_form_change_internal(fc cif.form_change, pending_project_revision_id int default null)
returns cif.form_change as $$
begin
  return fc;
end;
  $$ language plpgsql stable;

insert into cif.form_change(
      id,
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name
    ) overriding system value values (
      12345,
      '{}'::jsonb,
      'create',
      'cif',
      'some_table',
      12345,
      null,
      'pending',
      'reporting_requirement'
    );

/** END SETUP **/

-- Returns the committed form_change record
select results_eq(
  $$
    select
      id,
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name,
      validation_errors
    from cif.commit_form_change(
      12345,
       (select row( null, '{"updated":true}', null, null, null, null, null, null, null, '[]', null, null, null, null, null)::cif.form_change)
    );
  $$,
  $$
    values (
       12345,
      '{"updated":true}'::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'some_table'::varchar,
      12345,
      null::int,
      'pending'::varchar,
      'reporting_requirement'::varchar,
      '[]'::jsonb
    )
  $$,
  'commit_form_change calls the private commit_form_change_internal() function'
);

select is (
  (select new_form_data from cif.form_change where id = 12345),
  '{"updated":true}'::jsonb,
  'commit_form_change() updates new_form_data when called'
);

select finish();

rollback;
