begin;

select plan(4);

set client_min_messages to warning; -- don't show the truncate messages
truncate table cif.project_contact restart identity; -- truncate to restart the sequence


insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.contact(id, given_name, family_name, email)
overriding system value
values
(1, 'given name 1', 'family name 1', 'email1@email.com'),
(2, 'given name 2', 'family name 2', 'email2@email.com'),
(3, 'given name 3', 'family name 3', 'email3@email.com'),
(4, 'given name 4', 'family name 4', 'email4@email.com');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, rfp_number, summary, project_name)
overriding system value
values (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, project_id)
overriding system value
values (1, 'pending', 1), (2, 'pending', 1), (3, 'pending', 1), (4, 'pending', 1);

insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, new_form_data, change_status, change_reason, json_schema_name)
values
(1, 'create', 'cif', 'project_contact', null, '{"projectId": 1, "contactId": 1, "contactIndex": 0}', 'pending', 'add contact', 'contact'),
(2, 'update', 'cif', 'project_contact', 1, '{"projectId": 1, "contactId": 2, "contactIndex": 0}', 'pending', 'update contact', 'contact'),
(2, 'create', 'cif', 'project_contact', null, '{"projectId": 1, "contactId": 3, "contactIndex": 1}', 'pending', 'add contact', 'contact'),
(3, 'archive', 'cif', 'project_contact', 1, '{}', 'pending', 'remove contact', 'contact'),
(3, 'create', 'cif', 'project_contact', null, '{"projectId": 1, "contactId": 4, "contactIndex": 2}', 'pending', 'add contact', 'contact'),
(4, 'update', 'cif', 'project_contact', 2, '{"projectId": 1, "contactId": 1, "contactIndex": 1}', 'pending', 'add contact', 'contact'),
(4, 'create', 'cif', 'project_contact', null, '{"projectId": 1, "contactId": 2, "contactIndex": 0}', 'pending', 'add contact', 'contact');


update cif.project_revision set change_status = 'committed' where id in (1, 2, 3);

alter table cif.project_revision disable trigger _100_committed_changes_are_immutable;
alter table cif.project_revision disable trigger _100_timestamps;
alter table cif.form_change disable trigger _100_committed_changes_are_immutable;
alter table cif.form_change disable trigger _100_timestamps;
-- Ensure the updated_at timestamps are different between the committed revisions
update cif.project_revision set updated_at = updated_at + interval '1 hour' where id = 2;
update cif.form_change set updated_at = updated_at + interval '1 hour' where project_revision_id = 2;

update cif.project_revision set updated_at = updated_at + interval '2 hours' where id = 3;
update cif.form_change set updated_at = updated_at + interval '2 hour' where project_revision_id = 4;

update cif.project_revision set updated_at = updated_at + interval '3 hours' where id = 4;
update cif.form_change set updated_at = updated_at + interval '3 hour' where project_revision_id = 4;

alter table cif.project_contact disable trigger _100_timestamps;
alter table cif.project_contact disable trigger _050_immutable_archived_records;

-- project contact was updated in revision 3
update cif.project_contact set archived_at = (select updated_at from cif.project_revision where id=3) where id = 1;

select results_eq(
$$
  select new_form_data from cif.project_revision_project_contact_form_changes(
    (select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1)
  )
$$,
$$
  values ('{"projectId": 1, "contactId": 1, "contactIndex": 0}'::jsonb)
$$,
'returns the correct form_data for the first committed revision'
);

select results_eq(
$$
  select new_form_data from cif.project_revision_project_contact_form_changes(
    (select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=2)
  )
$$,
$$
  values
  ('{"projectId": 1, "contactId": 2, "contactIndex": 0}'::jsonb),
  ('{"projectId": 1, "contactId": 3, "contactIndex": 1}'::jsonb)
$$,
'returns the correct form_data for the second committed revision'
);

select results_eq(
$$
  select new_form_data from cif.project_revision_project_contact_form_changes(
    (select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=3)
  )
$$,
$$
  values
  ('{"projectId": 1, "contactId": 3, "contactIndex": 1}'::jsonb),
  ('{"projectId": 1, "contactId": 4, "contactIndex": 2}'::jsonb)
$$,
'returns the correct form_data for the third committed revision'
);

select results_eq(
$$
  select new_form_data from cif.project_revision_project_contact_form_changes(
    (select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=4)
  )
$$,
$$
  values
  ('{"projectId": 1, "contactId": 2, "contactIndex": 0}'::jsonb),
  ('{"projectId": 1, "contactId": 1, "contactIndex": 1}'::jsonb),
  ('{"projectId": 1, "contactId": 4, "contactIndex": 2}'::jsonb)
$$,
'returns the correct form_data for the fourth committed revision'
);

select finish();
rollback;
