begin;

select plan(4);

insert into cif.project_revision(id, change_status)
  overriding system value
  values
  (1, 'pending'),
  (2, 'pending'),
  (3, 'pending'),
  (4, 'pending');

insert into cif.form_change(
  id,
  operation,
  form_data_schema_name,
  form_data_table_name,
  form_data_record_id,
  project_revision_id,
  json_schema_name,
  new_form_data
) overriding system value
-- funding parameter form changes
values (
  1,
  'create',
  'cif',
  'funding_parameter',
  1,
  1,
  'funding_parameter_IA',
  '{"projectId": 1,  "maxFundingAmount": 100}'
),
(
  2,
  'create',
  'cif',
  'funding_parameter',
  2,
  2,
  'funding_parameter_IA',
  '{"projectId": 1,  "maxFundingAmount": 100}'
),
(
  3,
  'update',
  'cif',
  'funding_parameter',
  3,
  3,
  'funding_parameter_IA',
  '{}'
),
(
  4,
  'create',
  'cif',
  'funding_parameter',
  4,
  4,
  'funding_parameter_IA',
  '{"projectId": 1,  "maxFundingAmount": 100}'
),
(
  5,
  'create',
  'cif',
  'project_summary_report',
  5,
  2,
  'project_summary_report',
  '{"projectSummaryReportPayment":20}'
),
(
  6,
  'create',
  'cif',
  'project_summary_report',
  6,
  4,
  'project_summary_report',
  '{"projectSummaryReportPayment":20}'
),
(
  7,
  'create',
  'cif',
  'project_summary_report',
  7,
  4,
  'project_summary_report',
  '{"projectSummaryReportPayment":25}'
),
(
  8,
  'create',
  'cif',
  'project_summary_report',
  8,
  4,
  'project_summary_report',
  '{"projectSummaryReportPayment":30}'
);


-- TODO: test other operations? eg. if archive?
select is(
  (
    select cif.form_change_calculated_total_payment_amount_to_date((select row(form_change.*)::cif.form_change from cif.form_change where id=1))
  ),
  80.00,
  'Returns the the calculated total payment amount when only the maximum funding amount is filled in.'
);

select is(
  (
    select cif.form_change_calculated_total_payment_amount_to_date((select row(form_change.*)::cif.form_change from cif.form_change where id=2))
  ),
  100.00,
  'Returns the calculated total payment amount when both the maximum funding amount and Project Summary Report Payment are filled in.'
);

select is(
  (
    select cif.form_change_calculated_total_payment_amount_to_date((select row(form_change.*)::cif.form_change from cif.form_change where id=3))
  ),
  null,
  'Returns null when neither the maximum funding amount and Project Summary Report Payment are filled in.'
);

select is(
  (
    select cif.form_change_calculated_total_payment_amount_to_date((select row(form_change.*)::cif.form_change from cif.form_change where id=4))
  ),
  110.00,
  'Returns the calculated total payment amount when the maximum funding amount and the Project Summary Report Payment has been changed multiple times.'
);


select finish();
rollback;
