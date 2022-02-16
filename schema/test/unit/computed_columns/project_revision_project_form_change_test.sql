

begin;

select plan(4);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending');
insert into cif.form_change(id, operation, form_data_schema_name, form_data_table_name, project_revision_id, change_reason, json_schema_name)
  overriding system value
  values
    (1, 'create', 'cif', 'project', 1, 'test reason', 'project'),
    (2, 'create', 'cif', 'some_other_table', 1, 'test reason', 'some_other_table'),
    (3, 'create', 'test_schema_name', 'project', 1, 'test reason', 'project');

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select form_data_table_name from cif.project_revision_project_form_change((select * from record))
  ),
  'project',
  'Only returns the form change record for the project table'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select form_data_table_name from cif.project_revision_project_form_change((select * from record))
  ),
  null,
  'Returns null if there is no form change for the project table'
);


-- Setting up the test data for the following scenario:
-- For our project (id = 1), we have multiple revisions:
-- revision 3: committed, with a form change for the project table (id = 4)
-- revision 4: committed, without a form change for the project table
-- revision 5: pending, without a form change for the project table
alter table cif.form_change disable trigger commit_form_change;
insert into cif.operator(id, legal_name)
  overriding system value
  values (1, 'test operator');
insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, rfp_number, summary, project_name)
  overriding system value
  values (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (3, 'pending', 1), (4, 'pending', 1), (5, 'pending', 1);

insert into cif.form_change(
  id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, change_reason, json_schema_name)
  overriding system value
  values
    (4, 'create', 'cif', 'project', 1, 3, 'test reason', 'project');

update cif.project_revision set change_status = 'committed' where id = 3 or id = 4;

select is(
  (
    select id from cif.project_revision_project_form_change(
      (select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=4)
    )
  ),
  4,
  'returns the latest form change record for the project table when there is no form change in the revision and the current project_revision is pending'
);


select is(
  (
    select id from cif.project_revision_project_form_change(
      (select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=5)
    )
  ),
  4,
  'returns the latest form change record for the project table when there is no form change in the revision and the current project_revision is committed'
);

select finish();

rollback;
