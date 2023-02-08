begin;

select plan(4);

truncate table cif.form_change restart identity;
truncate cif.project restart identity cascade;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'committed', 'reason for change', 1),
  (2, 'committed', 'reason for change', 1),
  (3, 'committed', 'reason for change', 1);

alter table cif.form_change disable trigger _set_previous_form_change_id;

insert into cif.form(slug, json_schema, description) values ('test', '{}'::jsonb, 'test description');

insert into cif.form_change(project_revision_id, previous_form_change_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values
  (1, null, 'create', 'cif', 'project', 1, 'test', 'pending'),
  (1, null, 'create', 'cif', 'contact', 1, 'test', 'pending'),
  (2, 1, 'update', 'cif', 'project', 1, 'test', 'pending'),
  (2, 2, 'update', 'cif', 'contact', 1, 'test', 'pending'),
  (3, 3, 'create', 'cif', 'project', 1, 'test', 'pending'),
  (3, 4, 'update', 'cif', 'contact', 1, 'test', 'pending');

select has_function('cif_private', 'migration_set_original_parent_form_change_id', 'function cif_private.migration_set_original_parent_form_change_id exists');

select results_eq (
  $$ (select previous_form_change_id, original_parent_form_change_id from cif.form_change where id=3) $$,
  $$ values (1, null::integer) $$,
  'form_change record has corect previous_form_change_id, and original_parent_form_change_id is null before the migrations is run'
);

select cif_private.migration_set_original_parent_form_change_id();
select results_eq (
  $$ (select previous_form_change_id, original_parent_form_change_id from cif.form_change where id=3) $$,
  $$ values (1, 1) $$,
  'The migration function copied the value from previous_form_change_id into original_parent_form_change_id'
);

select is(
  (select original_parent_form_change_id from cif.form_change where id = 1),
  null::integer,
  'form_change records with null previous_form_change_id have null original_parent_form_change_id after the migration function has been run'
);

select finish();

rollback;
