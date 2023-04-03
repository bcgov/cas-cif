

begin;


select plan(4);


-- Test Setup --

truncate table cif.project restart identity cascade;

insert into cif.operator(id, legal_name) overriding system value values (1, 'Test Operator');

select cif.create_project(1);
select cif.create_project(5);
update cif.form_change
  set new_form_data=jsonb_build_object(
      'operatorId', 1,
      'fundingStreamRfpId', 1,
      'projectStatusId', 1,
      'proposalReference', 'TESTREF-' || id,
      'summary', 'lorem ipsum dolor sit amet adipiscing eli',
      'projectName', 'Test Project',
      'totalFundingRequest', 1000000,
      'sectorName', 'Agriculture',
      'projectType', 'Carbon Capture',
      'score', 50
      )
  where form_data_table_name='project';


insert into cif.form(slug, json_schema, description) values ('additional_funding_source', '{}', 'test');

insert into cif.form_change(
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name
    )
values
       -- first project with no data and no additional funding sources
       ('{"projectId": 1 }'::jsonb,
        'create',
        'cif',
        'funding_parameter',
        1,
        1,
        'pending',
        'funding_parameter_EP')
       ,
        -- second project with all the data and additional funding sources
        (json_build_object(
            'projectId', 2,
            'provinceSharePercentage', 50,
            'maxFundingAmount', 1,
            'anticipatedFundingAmount', 1,
            'proponentCost',777,
            'contractStartDate', '2012-01-01',
            'projectAssetsLifeEndDate', '2012-01-01'
            ),
        'create',
        'cif',
        'funding_parameter',
        2,
        2,
        'pending',
        'funding_parameter_IA'),
       (json_build_object(
            'projectId', 2,
            'sourceIndex', 1,
            'source', 'awaiting approval source',
            'amount', 1000,
            'status', 'Awaiting Approval'
          ),
        'create',
        'cif',
        'additional_funding_source',
        null,
        2,
        'pending',
        'additional_funding_source'),
        (json_build_object(
            'projectId', 2,
            'sourceIndex', 2,
            'source', 'approved source',
            'amount', 2000,
            'status', 'Approved'
          ),
        'create',
        'cif',
        'additional_funding_source',
        null,
        2,
        'pending',
        'additional_funding_source');


select cif.commit_project_revision(1);

-- We can't use the cif.create_project_revision() function since it is already updated with the new schema, so we create the form_changes manually.
insert into cif.project_revision(project_id, change_status) values (1, 'pending');

select cif.create_form_change(
  operation => 'update',
  json_schema_name => fc.json_schema_name,
  form_data_schema_name => 'cif',
  form_data_table_name => fc.form_data_table_name,
  form_data_record_id => fc.form_data_record_id,
  project_revision_id => 3
) from cif.form_change fc where project_revision_id = 1;


-- End Test Setup --



-- At this point, we have 3 revisions:
  -- One committed (id=1) and one pending (id=3) for the project_id=1
  -- One pending (id=2) for the project_id=2


alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_funding_parameter_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

select is(
  (select count(*) from cif.form_change where (form_data_table_name='additional_funding_source')),
  0::bigint,
  'There are no form_change records left for the additional_funding_source table'
);

-- it takes the additional sources info from existing revisions and puts them into the funding_parameter_EP/IA json schema
  -- for committed form changes
  -- for pending form changes
select results_eq(
  $$
    select change_status, new_form_data from cif.form_change where form_data_table_name='funding_parameter' order by id;
  $$,
  $$
   values ('committed'::varchar, '{"projectId": 1 }'::jsonb),
          ('pending'::varchar, '{
                                    "projectId": 2,
                                    "provinceSharePercentage": 50,
                                    "maxFundingAmount": 1,
                                    "anticipatedFundingAmount": 1,
                                    "proponentCost":777,
                                    "contractStartDate": "2012-01-01",
                                    "projectAssetsLifeEndDate": "2012-01-01",
                                    "additionalFundingSources": [
                                        {
                                        "source": "awaiting approval source",
                                        "amount": 1000,
                                        "status": "Awaiting Approval"},
                                        {
                                        "source": "approved source",
                                        "amount": 2000,
                                        "status": "Approved"}
                                    ]
                                      }'::jsonb)

  $$,
  'It add the additional_funding_source records into the funding_parameter so we have only one single form_change. If there are no additional_funding_sources, nothing is added to the new_form_data.'
);


-- It is idempotent
-- We re-run the first 3 tests to make sure nothing has changed

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_funding_parameter_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

select is(
  (select count(*) from cif.form_change where (form_data_table_name='additional_funding_source') and project_revision_id is not null),
  0::bigint,
  'There are no form_change records left for the additional_funding_source table that is associated to a revision'
);


-- it takes the funding and additional sources info from existing revisions and puts them into the new json schema
  -- for committed form changes
  -- for pending form changes
select results_eq(
  $$
    select change_status, new_form_data from cif.form_change where form_data_table_name='funding_parameter' order by id limit 2;
  $$,
  $$
   values ('committed'::varchar, '{"projectId": 1 }'::jsonb),
          ('pending'::varchar, '{
                                    "projectId": 2,
                                    "provinceSharePercentage": 50,
                                    "maxFundingAmount": 1,
                                    "anticipatedFundingAmount": 1,
                                    "proponentCost":777,
                                    "contractStartDate": "2012-01-01",
                                    "projectAssetsLifeEndDate": "2012-01-01",
                                    "additionalFundingSources": [
                                        {
                                        "source": "awaiting approval source",
                                        "amount": 1000,
                                        "status": "Awaiting Approval"},
                                        {
                                        "source": "approved source",
                                        "amount": 2000,
                                        "status": "Approved"}
                                    ]
                                      }'::jsonb)

  $$,
  'It transforms the double (funding_parameter and additional_funding_sources) into one single form_change'
);


select finish();

rollback;
