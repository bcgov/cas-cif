begin;
select plan(6);

insert into cif.cif_user (uuid, first_name, last_name, email_address)
values ('00000000-0000-0000-0000-000000000000', 'test', 'Testuser', 'test@somemail.com'),
       ('11111111-1111-1111-1111-111111111111', 'test1', 'Testuser', 'test1@somemail.com');

set jwt.claims.sub to '00000000-0000-0000-0000-000000000000';

select is(
  (select id from cif.pending_new_project_revision()), null,
  'Project revision should be null if there is no pending project revision'
);

select cif.create_project();

select is(
  (select id from cif.pending_new_project_revision()), 1,
  'Project revision should exist if there is a pending project revision from the current user'
);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

select is(
  (select id from cif.pending_new_project_revision()), null,
  'Project revision should be null if the pending project revision is not from the current user'
);

set jwt.claims.sub to '00000000-0000-0000-0000-000000000000';

-- fill the forms and commit the current project revision
insert into cif.operator(legal_name) values ('test operator');
insert into cif.funding_stream(name, description) values ('stream', 'stream description');

update cif.form_change set new_form_data=format('{
      "projectName": "name",
      "summary": "lorem ipsum",
      "fundingStreamRfpId": 1,
      "rfpNumber": "1235",
      "operatorId": %s
    }',
    (select id from cif.operator order by id desc limit 1)
  )::jsonb
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
    and form_data_table_name='project';

update cif.form_change set new_form_data=format('{
      "projectId": %s,
      "cifUserId": %s
    }',
    (select form_data_record_id from cif.form_change
        where form_data_table_name='project'
        and project_revision_id=(select id from cif.project_revision order by id desc limit 1)),
    (select id from cif.cif_user order by id desc limit 1)
  )::jsonb
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1) and form_data_table_name='project_manager';

update cif.project_revision set change_status='committed' where id=(select id from cif.project_revision order by id desc limit 1);

select is(
  (select id from cif.pending_new_project_revision()), null,
  'Project revision should be null if the project revision was committed'
);

-- A deleted revision is not returned

select cif.create_project();

select isnt(
  (select id from cif.pending_new_project_revision()),
  null,
  'Project revision should exist after creation'
);

update cif.project_revision set deleted_at = now() where id=(select id from cif.project_revision order by id desc limit 1);

select is(
  (select id from cif.pending_new_project_revision()),
  null,
  'Project revision should not exist after being marked deleted'
);

select finish();
rollback;
