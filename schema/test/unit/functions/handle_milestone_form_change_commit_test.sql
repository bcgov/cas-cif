begin;

select plan(20);

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
  cif.project_revision_amendment_type,
  cif.project_attachment
restart identity;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (1, 'pending', 1);


select cif.create_form_change('create', 'milestone', 'cif', 'reporting_requirement', '{}', 7, null, 'staged', '[]');
select cif.create_form_change('update', 'milestone', 'cif', 'reporting_requirement', '{"description": "value"}', null, null, 'committed', '[]');
select cif.create_form_change('create', 'milestone', 'cif', 'reporting_requirement',
  '{
    "reportType": "General Milestone",
    "reportDueDate": "2021-08-31 14:24:46.318423-07",
    "submittedDate": "2021-08-31 14:24:46.318423-07",
    "comments": "comments",
    "reportingRequirementIndex": 1,
    "description": "desc",
    "substantialCompletionDate": "2021-08-29 14:24:46.318423-07",
    "certifiedBy": "Jon",
    "certifierProfessionalDesignation": "Eng",
    "maximumAmount": 100,
    "totalEligibleExpenses": 200,
    "adjustedGrossAmount": 300,
    "calculatedGrossAmount": 350,
    "calculatedNetAmount": 450,
    "dateSentToCsnr": "2021-08-29 14:24:46.318423-07"
  }', null, 1, 'staged', '[]');

select cif.create_form_change('create', 'milestone', 'cif', 'reporting_requirement',
  '{
    "reportType": "Reporting Milestone",
    "reportDueDate": "2021-10-31 14:24:46.318423-07",
    "submittedDate": "2021-09-30 14:24:46.318423-07",
    "comments": "reporting milestone comments",
    "reportingRequirementIndex": 2,
    "description": "desc",
    "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
    "certifiedBy": "Reporting Jon",
    "certifierProfessionalDesignation": "Reporting Eng"
  }', null, 1, 'staged', '[]');

select cif.create_form_change('update', 'project', 'cif', 'project', '{}', 1, 1, 'pending', '[]');

/** SETUP END **/

-- Test 1
select results_eq(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id = 1
  ) select cif_private.handle_milestone_form_change_commit((select * from record));
  $$,
  $$
  values (
    7
  )
  $$,
  'Returns the form_data_record_id when new_form_data is empty'
);

-- Test 2
select throws_like(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id = 2
  ) select cif_private.handle_milestone_form_change_commit((select * from record));
  $$,
  'Cannot commit form_change. It has already been committed.',
  'Throws an exception if the form_change has a change_status of committed'
);


/** The next three tests confirm that the correct values were added to their three corresponding tables (reporting_requirement, milestone_report, & payment)
 after performing the commit, when the form_change operation is "create"

**/
select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 3));
-- reporting_requirement table
-- Test 3
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 1;
  $$,
  $$
  values (
  '2021-08-31 14:24:46.318423-07'::timestamptz,
  '2021-08-31 14:24:46.318423-07'::timestamptz,
  'comments'::varchar,
  1
  )
  $$,
  'The correct values were added to the reporting_requirement table on create'
);
-- milestone_report table
-- Test 4
select results_eq(
  $$
    select reporting_requirement_id,
      substantial_completion_date,
      certified_by,
      certifier_professional_designation,
      maximum_amount,
      total_eligible_expenses
    from cif.milestone_report where id = 1;
  $$,
  $$
  values (
    1,
    '2021-08-29 14:24:46.318423-07'::timestamptz,
    'Jon'::varchar,
    'Eng'::varchar,
    100::numeric,
    200::numeric
  )
  $$,
  'The correct values were added to the milestone_report table on create'
);
-- payment table
-- Test 5
select results_eq(
  $$
  select reporting_requirement_id, gross_amount, net_amount, date_sent_to_csnr from cif.payment where id = 1;
  $$,
  $$
  values (
    1,
    300::numeric,
    450::numeric,
    '2021-08-29 14:24:46.318423-07'::timestamptz
  )
  $$,
  'The correct values were added to the payment table on create'
);

/** The next three tests confirm that the correct values were added to their three corresponding tables (reporting_requirement, milestone_report, & not payment)
 after performing the commit, when the form_change operation is "create" for a non-expense report type

**/
select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 4));
-- reporting_requirement table
-- Test 6
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 2;
  $$,
  $$
  values (
  '2021-10-31 14:24:46.318423-07'::timestamptz,
  '2021-09-30 14:24:46.318423-07'::timestamptz,
  'reporting milestone comments'::varchar,
  2
  )
  $$,
  'The correct values were added to the reporting_requirement table on create for a non-expense report type'
);
-- milestone_report table
-- Test 7
select results_eq(
  $$
    select reporting_requirement_id,
      substantial_completion_date,
      certified_by,
      certifier_professional_designation,
      maximum_amount,
      total_eligible_expenses
    from cif.milestone_report where id = 2;
  $$,
  $$
  values (
    2,
    '2021-09-29 14:24:46.318423-07'::timestamptz,
    'Reporting Jon'::varchar,
    'Reporting Eng'::varchar,
    null::numeric,
    null::numeric
  )
  $$,
  'The correct values were added to the milestone_report table on create for a non-expense report type'
);
-- payment table
-- Test 8
select is_empty(
  $$
  select * from cif.payment where reporting_requirement_id = 2;
  $$,
  'No payment record was created for a non-expense report type'
);

-- The next three tests confirm that the correct values were added to their three corresponding tables when the form_change operation is "update"
update cif.project_revision set change_status = 'committed' where id = 1;
insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (2, 'pending', 1);

select cif.create_form_change('update', 'milestone', 'cif', 'reporting_requirement',
  '{
    "reportType": "General Milestone",
    "reportDueDate": "2021-10-31 14:24:46.318423-07",
    "submittedDate": "2021-09-30 14:24:46.318423-07",
    "comments": "new comments",
    "reportingRequirementIndex": 1,
    "description": "desc",
    "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
    "certifiedBy": "Jon",
    "certifierProfessionalDesignation": "Eng",
    "maximumAmount": 111,
    "totalEligibleExpenses": 222,
    "calculatedGrossAmount": 355,
    "adjustedNetAmount": 999,
    "calculatedNetAmount": 643,
    "dateSentToCsnr": "2021-09-29 14:24:46.318423-07"
  }', 1, 2, 'staged', '[]');

select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 6));
-- reporting_requirement table
-- Test 9
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 1;
  $$,
  $$
  values (
  '2021-10-31 14:24:46.318423-07'::timestamptz,
  '2021-09-30 14:24:46.318423-07'::timestamptz,
  'new comments'::varchar,
  1
  )
  $$,
  'The values were correctly updated in reporting_requirement table on update'
);
-- milestone_report table
-- Test 10
select results_eq(
  $$
    select reporting_requirement_id,
      substantial_completion_date,
      certified_by,
      certifier_professional_designation,
      maximum_amount,
      total_eligible_expenses
    from cif.milestone_report where id = 1;
  $$,
  $$
  values (
    1,
    '2021-09-29 14:24:46.318423-07'::timestamptz,
    'Jon'::varchar,
    'Eng'::varchar,
    111::numeric,
    222::numeric
  )
  $$,
  'The values were correctly updated in the milestone_report table on update'
);
-- payment table
-- Test 11
select results_eq(
  $$
  select reporting_requirement_id, gross_amount, net_amount, date_sent_to_csnr from cif.payment where id = 1;
  $$,
  $$
  values (
    1,
    355::numeric,
    999::numeric,
    '2021-09-29 14:24:46.318423-07'::timestamptz
  )
  $$,
  'The values were correctly updated in the payment table on update'
);


-- Testing updating a expense report type milestone with a non-expense report type
update cif.project_revision set change_status = 'committed' where id = 2;
insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (3, 'pending', 1);

select cif.create_form_change('update', 'milestone', 'cif', 'reporting_requirement',
  '{
    "reportType": "Reporting Milestone",
    "reportDueDate": "2021-10-31 14:24:46.318423-07",
    "submittedDate": "2021-09-30 14:24:46.318423-07",
    "comments": "reporting milestone comments",
    "reportingRequirementIndex": 1,
    "description": "desc",
    "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
    "certifiedBy": "Reporting Jon",
    "certifierProfessionalDesignation": "Reporting Eng"
  }', 1, 3, 'staged', '[]');


select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 7));
-- reporting_requirement table
-- Test 12
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 1;
  $$,
  $$
  values (
  '2021-10-31 14:24:46.318423-07'::timestamptz,
  '2021-09-30 14:24:46.318423-07'::timestamptz,
  'reporting milestone comments'::varchar,
  1
  )
  $$,
  'The values were correctly updated in reporting_requirement table on update with a non-expense report type'
);
-- -- milestone_report table
-- -- Test 13
select results_eq(
  $$
    select reporting_requirement_id,
      substantial_completion_date,
      certifier_professional_designation,
      maximum_amount,
      total_eligible_expenses
    from cif.milestone_report where id = 1;
  $$,
  $$
  values (
    1,
    '2021-09-29 14:24:46.318423-07'::timestamptz,
    'Reporting Eng'::varchar,
    null::numeric,
    null::numeric
  )
  $$,
  'The values were correctly updated in the milestone_report table on update with a non-expense report type'
);
-- -- payment table
-- -- Test 14
select results_eq(
  $$
  select reporting_requirement_id, gross_amount, net_amount, date_sent_to_csnr, archived_at from cif.payment where id = 1;
  $$,
  $$
  values (
    1,
    355::numeric,
    999::numeric,
    '2021-09-29 14:24:46.318423-07'::timestamptz,
    now()::timestamptz
  )
  $$,
  'Correctly archive the payment record when updating a expense report type milestone with a non-expense report type'
);

-- Testing updating a non-expense report type milestone with a expense report type
update cif.project_revision set change_status = 'committed' where id = 3;
insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (4, 'pending', 1);

select cif.create_form_change('update', 'milestone', 'cif', 'reporting_requirement',
  '{
    "reportType": "Advanced Milestone",
    "reportDueDate": "2021-10-31 14:24:46.318423-07",
    "submittedDate": "2021-09-30 14:24:46.318423-07",
    "comments": "advance new comments",
    "reportingRequirementIndex": 1,
    "description": "advance desc",
    "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
    "certifiedBy": "advance Jon",
    "certifierProfessionalDesignation": "advance Eng",
    "maximumAmount": 987.65,
    "totalEligibleExpenses": 789.65,
    "adjustedGrossAmount": 654.32,
    "calculatedGrossAmount": 654,
    "adjustedNetAmount": 456.78,
    "calculatedNetAmount": 321.45,
    "dateSentToCsnr": "2021-09-29 14:24:46.318423-07"
  }', 1, 4, 'staged', '[]');

select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 8));

-- reporting_requirement table
-- Test 15
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 1;
  $$,
  $$
  values (
  '2021-10-31 14:24:46.318423-07'::timestamptz,
  '2021-09-30 14:24:46.318423-07'::timestamptz,
  'advance new comments'::varchar,
  1
  )
  $$,
  'The values were correctly updated in reporting_requirement table on update with a expense report type'
);
-- milestone_report table
-- Test 16
select results_eq(
  $$
    select reporting_requirement_id,
      substantial_completion_date,
      certifier_professional_designation,
      maximum_amount,
      total_eligible_expenses
    from cif.milestone_report where id = 1;
  $$,
  $$
  values (
    1,
    '2021-09-29 14:24:46.318423-07'::timestamptz,
    'advance Eng'::varchar,
    987.65::numeric,
    789.65::numeric
  )
  $$,
  'The values were correctly updated in the milestone_report table on update with a expense report type'
);
-- payment table
-- Test 17
select results_eq(
  $$
  select reporting_requirement_id, gross_amount, net_amount, date_sent_to_csnr, archived_at from cif.payment where reporting_requirement_id = 1 and id = 2;
  $$,
  $$
  values (
    1,
    654.32::numeric,
    456.78::numeric,
    '2021-09-29 14:24:46.318423-07'::timestamptz,
    null::timestamptz
  )
  $$,
  'Correctly add a new payment record when updating a non-expense report type milestone with a expense report type'
);

-- Test 18
select lives_ok(
  $$
    select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 8));
  $$,
    'Throws no -Deleted records cannot be modified- error and update the correct payment record that is not archived when updating a milestone with a expense report type'
);

-- Testing updating a non-expense report type milestone with a expense report type
update cif.project_revision set change_status = 'committed' where id = 4;
insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (5, 'pending', 1);

select cif.create_form_change('update', 'milestone', 'cif', 'reporting_requirement',
  '{
    "reportType": "Reporting Milestone",
    "reportDueDate": "2021-10-31 14:24:46.318423-07",
    "submittedDate": "2021-09-30 14:24:46.318423-07",
    "comments": "reporting milestone comments",
    "reportingRequirementIndex": 1,
    "description": "desc",
    "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
    "certifiedBy": "Reporting Jon",
    "certifierProfessionalDesignation": "Reporting Eng"
  }', 1, 5, 'staged', '[]');

-- Test 19
select lives_ok(
  $$
    select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 9));
  $$,
    'Throws no -Deleted records cannot be modified- error and update the correct payment record that is not archived when updating a milestone with a non-expense report type'
);

-- Test archiving a milestone with a non-expense report type and the payment record is already archived
update cif.project_revision set change_status = 'committed' where id = 5;
insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (6, 'pending', 1);

select cif.create_form_change('archive', 'milestone', 'cif', 'reporting_requirement',
  '{
    "reportType": "Reporting Milestone",
    "reportDueDate": "2021-10-31 14:24:46.318423-07",
    "submittedDate": "2021-09-30 14:24:46.318423-07",
    "comments": "reporting milestone comments",
    "reportingRequirementIndex": 1,
    "description": "desc",
    "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
    "certifiedBy": "Reporting Jon",
    "certifierProfessionalDesignation": "Reporting Eng"
  }', 1, 6, 'staged', '[]');

-- Test 20
select lives_ok(
  $$
    select cif_private.handle_milestone_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 10));
  $$,
    'Throws no -Deleted records cannot be modified- error when archiving a milestone with a non-expense report type and the payment record is already archived'
);

select finish();

rollback;
