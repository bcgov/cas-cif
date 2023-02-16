begin;

select plan(6);

/** TEST SETUP **/
truncate cif.project restart identity cascade;
insert into cif.cif_user(id, session_sub)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111');

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

do $$
  declare current_revision cif.project_revision;

  begin
    current_revision := cif.create_project(3);

    update cif.form_change
    set new_form_data = jsonb_build_object(
        'operatorId', 1,
        'fundingStreamRfpId', 3,
        'projectStatusId', 1,
        'proposalReference', 001,
        'summary', 'lorem ipsum dolor sit amet adipiscing eli',
        'projectName', 'Test Project 1',
        'totalFundingRequest', cast(100000 as bigint),
        'sectorName', 'Agriculture',
        'projectType', 'Carbon Capture',
        'score', 10
        )
    where project_revision_id=current_revision.id and form_data_table_name='project';
    perform cif.commit_project_revision(1);
    perform cif.create_project_revision(1, 'Amendment');
    perform cif.create_project_revision(1, 'General Revision');
    update cif.form_change set new_form_data = new_form_data || '{"totalFundingRequest": 9}' where id=2;
    update cif.form_change set new_form_data = new_form_data || '{"projectStatusId": 2}' where id=3;
    perform cif.create_single_field_project_revision(1, 'project', '{"score": 1234}'::jsonb);
    -- id 4 ^
  end
$$;

select is(
  (select revision_type from cif.project_revision where id=4),
  'Minor Revision',
  'create_single_field_project_revision creates a Minor Revision'
);

select is(
  (select change_status from cif.project_revision where id=4),
  'committed',
  'create_single_field_project_revision commits the project revision that it creates'
);

select is(
  (select change_reason from cif.project_revision where id=4),
  'Changed score to ''1234''',
  'create_single_field_project_revision correctly sets the change_reason in the project_revision'
);

select is(
  (select new_form_data from cif.form_change where id=4),
  jsonb_build_object(
    'operatorId', 1,
    'fundingStreamRfpId', 3,
    'projectStatusId', 1,
    'proposalReference', 001,
    'summary', 'lorem ipsum dolor sit amet adipiscing eli',
    'projectName', 'Test Project 1',
    'totalFundingRequest', cast(100000 as bigint),
    'sectorName', 'Agriculture',
    'projectType', 'Carbon Capture',
    'score', 1234
  ),
  'create_single_field_project_revision clones the latest committed form change, and updates it with the new value'
);


select is(
  (select new_form_data from cif.form_change where id=2),
  jsonb_build_object(
    'operatorId', 1,
    'fundingStreamRfpId', 3,
    'projectStatusId', 1,
    'proposalReference', 001,
    'summary', 'lorem ipsum dolor sit amet adipiscing eli',
    'projectName', 'Test Project 1',
    'totalFundingRequest', cast(9 as bigint),
    'sectorName', 'Agriculture',
    'projectType', 'Carbon Capture',
    'score', 1234
  ),
  'create_single_field_project_revision updates the field on the corresponding form_change record for pending Amendment'
);

select is(
  (select new_form_data from cif.form_change where id=3),
  jsonb_build_object(
    'operatorId', 1,
    'fundingStreamRfpId', 3,
    'projectStatusId', 2,
    'proposalReference', 001,
    'summary', 'lorem ipsum dolor sit amet adipiscing eli',
    'projectName', 'Test Project 1',
    'totalFundingRequest', cast(100000 as bigint),
    'sectorName', 'Agriculture',
    'projectType', 'Carbon Capture',
    'score', 1234
  ),
  'create_single_field_project_revision updates the field on the corresponding form_change record for pending General Revision'
);

select finish();

rollback;
