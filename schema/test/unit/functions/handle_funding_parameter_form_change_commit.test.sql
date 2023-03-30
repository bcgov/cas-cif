begin;

select plan(15);

/** SETUP **/
truncate table cif.form_change,
  cif.project_revision,
  cif.project,
  cif.project_contact,
  cif.contact,
  cif.project_manager,
  cif.operator,
  cif.attachment,
  cif.emission_intensity_report,
  cif.milestone_report,
  cif.reporting_requirement,
  cif.payment,
  cif.funding_parameter,
  cif.additional_funding_source,
  cif.project_revision_amendment_type
restart identity;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values (1, 1, 1, 1, 'EP', 'summary EP', 'project EP');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values (2, 1, 6, 1, 'IA', 'summary IA', 'project IA');

insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values
    (1, 'pending', 1),
    (2, 'pending', 2);

select cif.create_form_change('create', 'funding_parameter_EP', 'cif', 'funding_parameter', '{}', 7, null, 'staged', '[]');
select cif.create_form_change('update', 'funding_parameter_IA', 'cif', 'funding_parameter', '{"anticipatedFundingAmount": 5}', null, null, 'committed', '[]');


select cif.create_form_change('create', 'funding_parameter_EP', 'cif', 'funding_parameter',
  '{
    "projectId":1,
    "holdbackPercentage":10,
    "provinceSharePercentage":50,
    "contractStartDate":"2023-03-09T23:59:59.999-08:00",
    "projectAssetsLifeEndDate":"2023-03-25T23:59:59.999-07:00",
    "maxFundingAmount":500,
    "proponentCost":5,
    "anticipatedFundingAmount":55,
    "additionalFundingSources":[{"source":"oldEPsource1","amount":555,"status":"Awaiting Approval"},{"source":"oldEPsource2","amount":666,"status":"Approved"}]
  }', null, 1, 'staged', '[]');

select cif.create_form_change('create', 'funding_parameter_IA', 'cif', 'funding_parameter',
  '{
       "projectId":2,
       "provinceSharePercentage":50,
       "additionalFundingSources":[{"source":"oldIAsource","amount":1,"status":"Awaiting Approval"}],
       "maxFundingAmount":100,
       "proponentCost":10,
       "contractStartDate":"2023-03-09T23:59:59.999-08:00",
       "projectAssetsLifeEndDate":"2023-03-24T23:59:59.999-07:00",
       "anticipatedFundingAmount":10
  }', null, 2, 'staged', '[]');


select cif.create_form_change('update', 'project', 'cif', 'project', '{}', 1, 1, 'pending', '[]');
select cif.create_form_change('update', 'project', 'cif', 'project', '{}', 2, 2, 'pending', '[]');



/** SETUP END **/

select results_eq(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id = 1
  ) select cif_private.handle_funding_parameter_form_change_commit((select * from record));
  $$,
  $$
  values (
    7
  )
  $$,
  'Returns the form_data_record_id when new_form_data is empty'
);

select throws_like(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id = 2
  ) select cif_private.handle_funding_parameter_form_change_commit((select * from record));
  $$,
  'Cannot commit form_change. It has already been committed.',
  'Throws an exception if the form_change has a change_status of committed'
);


/** The next tests confirm that the correct values were added to their two corresponsing tables (funding_parameter and additional_funding_sources)
 after performing the commit, when the form_change operation is "create"

**/

-- EP record
select cif_private.handle_funding_parameter_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 3));
-- funding_parameter table

select results_eq(
  $$
  select holdback_percentage, province_share_percentage, contract_start_date, project_assets_life_end_date, max_funding_amount, proponent_cost, anticipated_funding_amount from cif.funding_parameter where id = 1;
  $$,
  $$
  values (
        10::numeric,
        50::numeric,
        '2023-03-09T23:59:59.999-08:00'::timestamptz,
        '2023-03-25T23:59:59.999-07:00'::timestamptz,
        500::numeric,
        5::numeric,
        55::numeric
  )
  $$,
  'The correct EP values were added to the funding_parameter table on create'
);
-- additional_funding_source table
select results_eq(
  $$
    select source, amount, status, source_index
    from cif.additional_funding_source
    where project_id = 1;
  $$,
  $$
  values (
    'oldEPsource1'::varchar,
    555::numeric,
    'Awaiting Approval'::varchar,
    1
  ),
  (
    'oldEPsource2'::varchar,
    666::numeric,
    'Approved'::varchar,
    2
  )
  $$,
  'The correct EP values were added to the additional_funding_source table on create'
);

-- IA record
select cif_private.handle_funding_parameter_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 4));
-- funding_parameter table

select results_eq(
  $$
  select province_share_percentage, contract_start_date, project_assets_life_end_date, max_funding_amount, proponent_cost, anticipated_funding_amount from cif.funding_parameter where id = 2;
  $$,
  $$
  values (
        50::numeric,
        '2023-03-09T23:59:59.999-08:00'::timestamptz,
        '2023-03-24T23:59:59.999-07:00'::timestamptz,
        100::numeric,
        10::numeric,
        10::numeric
  )
  $$,
  'The correct IA values were added to the funding_parameter table on create'
);

-- additional_funding_source table
select results_eq(
  $$
    select source, amount, status, source_index
    from cif.additional_funding_source
    where project_id = 2;

  $$,
  $$
  values (
    'oldIAsource'::varchar,
    1::numeric,
    'Awaiting Approval'::varchar,
    1
  )
  $$,
  'The correct IA values were added to the additional_funding_source table on create'
);

-- The next three tests confirm that the correct values were added/removed/updated to their corresponsing tables when the form_change operation is "update"
update cif.project_revision set change_status = 'committed' where id = 1;
update cif.project_revision set change_status = 'committed' where id = 2;

insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values
  (3, 'pending', 1),
  (4, 'pending', 2);

select cif.create_form_change('update', 'project', 'cif', 'project', '{}', 1, 3, 'pending', '[]');
select cif.create_form_change('update', 'project', 'cif', 'project', '{}', 2, 4, 'pending', '[]');

select cif.create_form_change('update', 'funding_parameter_EP', 'cif', 'funding_parameter',
  '{
    "projectId":1,
    "holdbackPercentage":7,
    "provinceSharePercentage":7,
    "contractStartDate":"2027-03-09T23:59:59.999-08:00",
    "projectAssetsLifeEndDate":"2027-03-25T23:59:59.999-07:00",
    "maxFundingAmount":7,
    "proponentCost":5,
    "anticipatedFundingAmount":55,
    "additionalFundingSources":[{"source":"newEPsource1","amount":7,"status":"Awaiting Approval"}]
  }', 1, 3, 'staged', '[]');
  select cif.create_form_change('update', 'funding_parameter_IA', 'cif', 'funding_parameter',
  '{
    "projectId":1,
    "provinceSharePercentage":9,
    "contractStartDate":"2029-03-09T23:59:59.999-08:00",
    "projectAssetsLifeEndDate":"2029-03-25T23:59:59.999-07:00",
    "maxFundingAmount":9,
    "proponentCost":5,
    "anticipatedFundingAmount":55,
    "additionalFundingSources":[{"source":"iasource","amount":11,"status":"Awaiting Approval"}, {"source":"iasource2","amount":22,"status":"Awaiting Approval"}, {"source":"iasource3","amount":33,"status":"Awaiting Approval"}]
  }', 2, 4, 'staged', '[]');

-- EP projects
select cif_private.handle_funding_parameter_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 9));

-- funding_parameter table
select results_eq(
  $$
  select holdback_percentage, province_share_percentage, contract_start_date, project_assets_life_end_date, max_funding_amount, proponent_cost, anticipated_funding_amount from cif.funding_parameter where id = 1;
  $$,
  $$
  values (
        7::numeric,
        7::numeric,
        '2027-03-09T23:59:59.999-08:00'::timestamptz,
        '2027-03-25T23:59:59.999-07:00'::timestamptz,
        7::numeric,
        5::numeric,
        55::numeric
  )
  $$,
  'The correct EP values were updated in the funding_parameter table on update'
);

-- additional_funding_source table
select results_eq(
  $$
    select id, source, amount, status, source_index
    from cif.additional_funding_source
    where project_id = 1
    and archived_at is null;
  $$,
  $$
  values
  (
    1,
    'newEPsource1'::varchar,
    7::numeric,
    'Awaiting Approval'::varchar,
    1
  )
  $$,
  'The correct EP values were archived (anything with an id greater than 1 because the new test array contains only one test value) and updated in the additional_funding_sources table on update'
);


-- IA projects
select cif_private.handle_funding_parameter_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 10));
-- funding_parameter table
select results_eq(
  $$
  select province_share_percentage, contract_start_date, project_assets_life_end_date, max_funding_amount, proponent_cost, anticipated_funding_amount from cif.funding_parameter where id = 2;
  $$,
  $$
  values (
        9::numeric,
        '2029-03-09T23:59:59.999-08:00'::timestamptz,
        '2029-03-25T23:59:59.999-07:00'::timestamptz,
        9::numeric,
        5::numeric,
        55::numeric
  )
  $$,
  'The correct IA values were added to the funding_parameter table on update'
);
-- additional_funding_source table
select results_eq(
  $$
    select source, amount, status, source_index
    from cif.additional_funding_source
    where project_id = 2;
  $$,
  $$
  values (
    'iasource'::varchar,
    11::numeric,
    'Awaiting Approval'::varchar,
    1
  ),
  (
    'iasource2'::varchar,
    22::numeric,
    'Awaiting Approval'::varchar,
    2
  ),
  (
    'iasource3'::varchar,
    33::numeric,
    'Awaiting Approval'::varchar,
    3
  )
  $$,
  'The correct IA values were added to the additional_funding_sources table on update'
);


-- Archive tests

select cif.create_form_change('archive', 'funding_parameter_EP', 'cif', 'funding_parameter',
  '{"projectId":1 }', 1, 1, 'staged', '[]');
select cif.create_form_change('archive', 'funding_parameter_IA', 'cif', 'funding_parameter',
  '{"additionalFundingSources":[{"source":"iasource","amount":99,"status":"Awaiting Approval"}]}', 2, 2, 'staged', '[]');

  -- EP projects
select cif_private.handle_funding_parameter_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 9));
-- funding_parameter table
select isnt_empty(
  $$
  select archived_by from cif.funding_parameter where id = 1;
  $$,
  'The EP values were archived in the funding_parameter table on archive'
);
-- additional_funding_source table
select isnt_empty(
  $$
  select archived_by from cif.funding_parameter where id = 1;
  $$,
  'The EP values were archived in the additional_funding_source table on archive'
);

  -- IA projects
select cif_private.handle_funding_parameter_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 10));
-- funding_parameter table
select isnt_empty(
  $$
  select archived_by from cif.funding_parameter where id = 2;
  $$,
  'The IA values were archived in the funding_parameter table on archive'
);
-- additional_funding_source table
select isnt_empty(
  $$
  select archived_by from cif.funding_parameter where id = 2;
  $$,
  'The IA values were archived in the additional_funding_source table on archive'
);


select finish();

rollback;
