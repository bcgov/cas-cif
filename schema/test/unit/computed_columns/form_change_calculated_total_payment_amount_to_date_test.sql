begin;

select plan(7);

insert into cif.project_revision(id, change_status)
  overriding system value
  values
  (1, 'pending'),
  (2, 'pending'),
  (3, 'pending'),
  (4, 'pending'),
  (5, 'pending'),
  (6, 'pending'),
  (7, 'pending');

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

values ( -- create project with max funding amount (rev 1)
  1,
  'create',
  'cif',
  'funding_parameter',
  1,
  1,
  'funding_parameter_IA',
  '{"projectId": 1,  "maxFundingAmount": 100}'
),
( -- create project with max funding amount (rev 2)
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
  -- add project summary report payment (rev 2)
  5,
  'create',
  'cif',
  'project_summary_report',
  5,
  2,
  'project_summary_report',
  '{"projectSummaryReportPayment":20}'
),
( -- set all payments none (rev 3)
  3,
  'update',
  'cif',
  'funding_parameter',
  3,
  3,
  'funding_parameter_IA',
  '{"projectId": 1}'
),
( -- create project with max funding amout (rev 4)
  4,
  'create',
  'cif',
  'funding_parameter',
  4,
  4,
  'funding_parameter_IA',
  '{"projectId": 1,  "maxFundingAmount": 100}'
),
( -- add project summary report payment (rev 4)
  6,
  'create',
  'cif',
  'project_summary_report',
  6,
  4,
  'project_summary_report',
  '{"projectSummaryReportPayment":20}'
),
( -- add another project summary report payment (rev 4)
  7,
  'create',
  'cif',
  'project_summary_report',
  7,
  4,
  'project_summary_report',
  '{"projectSummaryReportPayment":25}'
),
( -- add another project summary report payment (rev 4)
  8,
  'create',
  'cif',
  'project_summary_report',
  8,
  4,
  'project_summary_report',
  '{"projectSummaryReportPayment":30}'
),
( -- create project without max funding amout (rev 5)
  9,
  'create',
  'cif',
  'funding_parameter',
  9,
  5,
  'funding_parameter_IA',
  '{"projectId": 1}'
),
( -- add another project summary report payment (rev 5)
  10,
  'create',
  'cif',
  'project_summary_report',
  10,
  5,
  'project_summary_report',
  '{"projectSummaryReportPayment":25}'
),
( -- create archived project with max funding amout (rev 6)
  11,
  'archive',
  'cif',
  'funding_parameter',
  11,
  6,
  'funding_parameter_IA',
  '{"projectId": 1, "maxFundingAmount": 200}'
),
( -- add project summary report payment (rev 6)
  12,
  'create',
  'cif',
  'project_summary_report',
  12,
  6,
  'project_summary_report',
  '{"projectSummaryReportPayment":25}'
),
( -- create project without max funding amout (rev 7)
  13,
  'archive',
  'cif',
  'funding_parameter',
  13,
  7,
  'funding_parameter_IA',
  '{"projectId": 1, "maxFundingAmount": 200}'
),
( -- add archived project summary report payment (rev 7)
  14,
  'archive',
  'cif',
  'project_summary_report',
  14,
  7,
  'project_summary_report',
  '{"projectSummaryReportPayment":25}'
);


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

select is (
  (
    select cif.form_change_calculated_total_payment_amount_to_date((select row(form_change.*)::cif.form_change from cif.form_change where id=5))
  ),
  null,
  'Returns null when the maximum funding amount is not filled in and Project Summary Report Payment is filled in.'
);

select is (
  (
    select cif.form_change_calculated_total_payment_amount_to_date((select row(form_change.*)::cif.form_change from cif.form_change where id=6))
  ),
  null,
  'Returns null when the maximum funding amount is archived.'
);

select is (
  (
    select cif.form_change_calculated_total_payment_amount_to_date((select row(form_change.*)::cif.form_change from cif.form_change where id=7))
  ),
  null,
  'Returns the the calculated total payment amount when the maximum funding amount is filled in and Project Summary Report Payment is archived.'
);


select finish();
rollback;
