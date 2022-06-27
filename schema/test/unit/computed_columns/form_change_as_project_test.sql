

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
    (1, 'create', 'cif', 'project', 1, 1, 'project', '{"operatorId": 1, "fundingStreamRfpId": 1, "projectStatusId": 1, "proposalReference": "001", "summary": "summary", "projectName": "project 1", "totalFundingRequest": 100, "comments": "some random comment"}'),
    (2, 'create', 'cif', 'operator', 1, 1, 'operator', '{"legalName": "I am an operator"}');
/** SETUP END **/

select results_eq(
  $$
  with record as (
  select row(form_change.*)::cif.form_change
  from cif.form_change where id=1
  ) select operator_id, funding_stream_rfp_id, project_status_id, total_funding_request, proposal_reference, summary, project_name, comments from cif.form_change_as_project((select * from record))
  $$,
  $$
  values(1::int, 1::int, 1::int, 100::numeric, '001'::varchar, 'summary'::varchar, 'project 1'::varchar, 'some random comment'::varchar)
  $$,
  'Returns a record with the correct data when passed a form_change record with a form_data_table_name of project'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select id from cif.form_change_as_project((select * from record))
  ),
  null,
  'Returns null when passed a form_change record with a form_data_table_name that is not project'
);

select finish();

rollback;
