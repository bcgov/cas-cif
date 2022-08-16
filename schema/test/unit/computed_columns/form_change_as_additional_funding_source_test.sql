

begin;

select plan(2);

/** SETUP **/
truncate table cif.change_status restart identity cascade;

insert into cif.change_status (status, triggers_commit, active)
values
  ('pending', false, true);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.form_change(id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, json_schema_name, new_form_data)
  overriding system value
  values
    (1, 'create', 'cif', 'additional_funding_source', 1, 1, 'additional_funding_source', '{"projectId": 1, "status": "Awaiting Approval", "source": "test source", "amount": "100", "sourceIndex": 1}'),
    (2, 'create', 'cif', 'operator', 1, 1, 'operator', '{"legalName": "I am an operator"}');
/** SETUP END **/

select results_eq(
  $$
  with record as (
  select row(form_change.*)::cif.form_change
  from cif.form_change where id=1
  ) select project_id, status, source, amount, source_index from cif.form_change_as_additional_funding_source((select * from record))
  $$,
  $$
  values(1::int, 'Awaiting Approval'::varchar, 'test source'::varchar, 100::numeric, 1::int)
  $$,
  'Returns a record with the correct data when passed a form_change record with a form_data_table_name of additional_funding_source'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select id from cif.form_change_as_additional_funding_source((select * from record))
  ),
  null,
  'Returns null when passed a form_change record with a form_data_table_name that is not additional_funding_source'
);

select finish();

rollback;
