begin;
select plan(5);

-- restart the id sequences
truncate table
cif.project,
cif.project_contact,
cif.project_manager,
cif.project_revision,
cif.emission_intensity_report,
cif.milestone_report,
cif.operator,
cif.contact,
cif.form_change,
cif.attachment,
cif.reporting_requirement,
cif.payment,
cif.funding_parameter,
cif.additional_funding_source,
cif.project_revision_amendment_type,
cif.project_attachment
restart identity;

insert into cif.cif_user (session_sub, given_name, family_name, email_address)
values ('00000000-0000-0000-0000-000000000000', 'test', 'Testuser', 'test@somemail.com'),
       ('11111111-1111-1111-1111-111111111111', 'test1', 'Testuser', 'test1@somemail.com');

set jwt.claims.sub to '00000000-0000-0000-0000-000000000000';

select is(
  (select id from cif.pending_new_project_revision()), null,
  'Project revision should be null if there is no pending project revision'
);


select cif.create_project(1);

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
insert into cif.contact(given_name, family_name, email) values ('John', 'Test', 'foo@abc.com');

update cif.form_change set new_form_data=format('{
      "projectName": "name",
      "summary": "lorem ipsum",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": %s
    }',
    (select id from cif.operator order by id desc limit 1)
  )::jsonb
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
    and form_data_table_name='project';

select cif.commit_project_revision(1);
select is(
  (select id from cif.pending_new_project_revision()), null,
  'Project revision should be null if the project revision was committed'
);

-- A deleted revision is not returned

select cif.create_project(1);

select isnt(
  (select id from cif.pending_new_project_revision()),
  null,
  'Project revision should exist after creation'
);

select finish();
rollback;
