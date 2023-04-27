begin;

select plan(6);

/** SETUP **/
/** some of these fields are unnecessary eg. emission_intensity and milestone **/
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
values (1, 1, 6, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (1, 'pending', 1);

select cif.create_form_change('create', 'project_summary_report', 'cif', 'project_summary_report', '{}', 7, null, 'staged', '[]');
select cif.create_form_change('update', 'project_summary_report', 'cif', 'project_summary_report', '{"description": "value"}', null, null, 'committed', '[]');
select cif.create_form_change('create', 'project_summary_report', 'cif', 'project_summary_report',
  '{
    "reportType": "Project Summary Report",
    "reportDueDate": "2021-08-31 14:24:46.318423-07",
    "submittedDate": "2021-08-31 14:24:46.318423-07",
    "comments": "comments",
    "reportingRequirementIndex": 1,
    "projectSummaryReportPayment": 111,
    "paymentNotes": "payment notes",
    "dateSentToCsnr": "2021-08-29 14:24:46.318423-07"
  }', null, 1, 'staged', '[]');

select cif.create_form_change('update', 'project', 'cif', 'project', '{}', 1, 1, 'pending', '[]');

/** SETUP END **/

select results_eq(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id = 1
  ) select cif_private.handle_project_summary_report_form_change_commit((select * from record));
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
  ) select cif_private.handle_project_summary_report_form_change_commit((select * from record));
  $$,
  'Cannot commit form_change. It has already been committed.',
  'Throws an exception if the form_change has a change_status of committed'
);


/** The next two tests confirm that the correct values were added to their corresponding tables (reporting_requirement & payment)
 after performing the commit, when the form_change operation is "create"
**/
select cif_private.handle_project_summary_report_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 3));
-- reporting_requiement table
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
  'The correct values were added to the reporting_requiement table on create'
);

-- payment table
select results_eq(
  $$
  select reporting_requirement_id, gross_amount, net_amount, date_sent_to_csnr from cif.payment where id = 1;
  $$,
  $$
  values (
    1,
    111::numeric,
    111::numeric,
    '2021-08-29 14:24:46.318423-07'::timestamptz
  )
  $$,
  'The correct values were added to the payment table on create'
);

/** The next two tests confirm that the correct values were added to their two corresponding tables (reporting_requirement & payment)
 after performing the commit, when the form_change operation is "update"
**/
update cif.project_revision set change_status = 'committed' where id = 1;
insert into cif.project_revision(id, change_status, project_id)
    overriding system value
    values(2, 'pending', 1);

select cif.create_form_change('update', 'project_summary_report', 'cif', 'project_summary_report',
  '{
    "reportType": "Project Summary Report",
    "reportDueDate": "2022-11-30 14:24:46.318423-07",
    "submittedDate": "2022-10-31 14:24:46.318423-07",
    "comments": "new comments",
    "reportingRequirementIndex": 1,
    "projectSummaryReportPayment": 222,
    "paymentNotes": "new payment notes",
    "dateSentToCsnr": "2022-09-29 14:24:46.318423-07"
  }', 1, 2, 'staged', '[]');

select cif_private.handle_project_summary_report_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 5));
-- reporting_requiement table
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 1;
  $$,
  $$
  values (
  '2022-11-30 14:24:46.318423-07'::timestamptz,
  '2022-10-31 14:24:46.318423-07'::timestamptz,
  'new comments'::varchar,
  1
  )
  $$,
  'The correct values were added to the reporting_requiement table on update'
);

-- payment table
select results_eq(
  $$
  select reporting_requirement_id, gross_amount, net_amount, date_sent_to_csnr from cif.payment where id = 1;
  $$,
  $$
  values (
    1,
    222::numeric,
    222::numeric,
    '2022-09-29 14:24:46.318423-07'::timestamptz
  )
  $$,
  'The correct values were added to the payment table on update'
);


select finish();

rollback;
