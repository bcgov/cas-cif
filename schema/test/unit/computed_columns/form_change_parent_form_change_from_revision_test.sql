begin;

select plan(7);

/** TEST SETUP **/
truncate cif.project restart identity cascade;

insert into cif.cif_user(id, uuid)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111');

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1'),
  (2, 1, 1, 1, '001', 'summary', 'project 2');

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'committed', 'reason for change', 1),
  (2, 'committed', 'reason for change', 1),
  (3, 'committed', 'reason for change', 1),
  (4, 'committed', 'reason for change', 2),
  (5, 'committed', 'reason for change', 1);

/** END SETUP **/


-- make sure the function exists
select has_function('cif_private', 'set_previous_form_change_id', 'Function set_previous_form_change_id should exist');

alter table cif.form_change disable trigger _set_previous_form_change_id;

-- create an inital form_change record
insert into cif.form_change(project_revision_id, previous_form_change_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values
  (1, null, 'create', 'cif', 'project', 1, 'test', 'pending'),
  (1, null, 'create', 'cif', 'contact', 1, 'test', 'pending'),
  (2, 1, 'update', 'cif', 'project', 1, 'test', 'pending'),
  (2, 2, 'update', 'cif', 'contact', 1, 'test', 'pending'),
  (3, 3, 'create', 'cif', 'project', 1, 'test', 'pending'),
  (3, 4, 'update', 'cif', 'contact', 1, 'test', 'pending'),
  (4, null, 'create', 'cif', 'project', 2, 'test', 'pending'),
  (5, 5, 'update', 'cif', 'project', 1, 'test', 'pending'),
  (5, 6, 'update', 'cif', 'contact', 1, 'test', 'pending');


select results_eq (
  $$
    select id from cif.form_change_parent_form_change_from_revision((select row(form_change.*)::cif.form_change from cif.form_change where id=8), null)
  $$,
  $$
  values (null::integer)
  $$,
  'cif.form_change_parent_form_change_from_revision should return null if not passed a revision id'
);

select results_eq (
  $$
    select id from cif.form_change_parent_form_change_from_revision((select row(form_change.*)::cif.form_change from cif.form_change where id=8), 4)
  $$,
  $$
  values (null::integer)
  $$,
  'cif.form_change_parent_form_change_from_revision should return null if the form_change does not have a parent change in the revision passed as a parameter'
);

select results_eq (
  $$
    select id from cif.form_change_parent_form_change_from_revision((select row(form_change.*)::cif.form_change from cif.form_change where id=7), 1)
  $$,
  $$
  values (null::integer)
  $$,
  'cif.form_change_parent_form_change_from_revision should return null if the form_change does not have a parent change'
);

select results_eq (
  $$
    select id from cif.form_change_parent_form_change_from_revision((select row(form_change.*)::cif.form_change from cif.form_change where id=8), 3)
  $$,
  $$
  values (5::integer)
  $$,
  'cif.form_change_parent_form_change_from_revision(8, 3) should return the correct form_change (id=5) from revision 3'
);

select results_eq (
  $$
    select id from cif.form_change_parent_form_change_from_revision((select row(form_change.*)::cif.form_change from cif.form_change where id=8), 1)
  $$,
  $$
  values (1::integer)
  $$,
  'cif.form_change_parent_form_change_from_revision(8, 3) should return the correct form_change (id=1) from revision 1'
);

select results_eq (
  $$
    select id from cif.form_change_parent_form_change_from_revision((select row(form_change.*)::cif.form_change from cif.form_change where id=6), 2)
  $$,
  $$
  values (4::integer)
  $$,
  'cif.form_change_parent_form_change_from_revision(6, 2) should return the correct form_change (id=4) from revision 2'
);

select finish();

rollback;
