

begin;

select plan(7);

truncate cif.form_change, cif.project_revision, cif.project_contact restart identity cascade;

select cif.create_project(1);


/* test 1 */
update cif.form_change set new_form_data='{}'::jsonb
  where project_revision_id=1
    and form_data_table_name='project';

select results_eq(
  $$
  select cif.get_form_status(1, 'project')
  $$,
  $$
  values('Not Started')
  $$,
  'Returns Not Started when the project form is empty and the form is pristine'
);

/* test 2 */
insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  change_status,
  project_revision_id
)
  values
(
  json_build_object(
    'projectId', 1,
    'contactId', 1,
    'contactIndex', 1
  ),
  'create', 'cif', 'project_contact', 'project_contact', 'pending', 1
);
select results_eq(
  $$
  select cif.get_form_status(1, 'project_contact')
  $$,
  $$
  values('In Progress')
  $$,
  'Returns In Progress when the project form is not empty and in pending status'
);

/* test 3 */
update cif.form_change set change_status='staged'
  where project_revision_id=1
    and form_data_table_name='project_contact';
select results_eq(
  $$
  select cif.get_form_status(1, 'project_contact')
  $$,
  $$
  values('Filled')
  $$,
  'Returns Filled when the project form staged'
);

/* test 4 */
update cif.form_change set change_status='staged', validation_errors='["error"]'::jsonb
  where project_revision_id=1
    and form_data_table_name='project_contact';
select results_eq(
  $$
  select cif.get_form_status(1, 'project_contact')
  $$,
  $$
  values('Attention Required')
  $$,
  'Returns Attention Required when there are validation errors and form change is staged'
);

/* test 5 */
update cif.form_change set change_status='pending', validation_errors='["error"]'::jsonb
  where project_revision_id=1
    and form_data_table_name='project_contact';
select results_eq(
  $$
  select cif.get_form_status(1, 'project_contact')
  $$,
  $$
  values('In Progress')
  $$,
  'Returns In Progress when there are validation errors and form change is pending'
);

/* test 6 */
update cif.form_change set new_form_data=null, change_status='pending'
  where project_revision_id=1
    and form_data_table_name='project_contact';
select results_eq(
  $$
  select cif.get_form_status(1, 'project')
  $$,
  $$
  values('Not Started')
  $$,
  'Returns Not Started when new form data is null and form change is pending'
);

update cif.form_change set new_form_data='{}', change_status='staged'
  where project_revision_id=1
    and form_data_table_name='project_contact';

/* test 7 */

update cif.form_change set operation='archive', change_status='staged'
  where project_revision_id=1
    and validation_errors != '[]'
    and form_data_table_name= 'project_contact';

select results_eq(
  $$
  select cif.get_form_status(1, 'project_contact')
  $$,
  $$
  values('Not Started')
  $$,
  'Ignores form_change records that are being archived when calculating the overall form_status'
);


select finish();

rollback;
