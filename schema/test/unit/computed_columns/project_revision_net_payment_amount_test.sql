begin;

select plan(2);

truncate cif.project_revision restart identity cascade;
truncate cif.form_change restart identity cascade;

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending'), (3, 'pending');

insert into cif.form_change(id, new_form_data, operation, change_status, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, json_schema_name, validation_errors)
  overriding system value
  values
    -- The containing reporting requirement
    (1,
     format('{"reportDueDate": "%s", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}',
     now() + interval '2 days')::jsonb,
     'create',
     'pending',
     'cif',
     'reporting_requirement',
     1,
     1,
     'reporting_requirement',
     '[]'),
    -- Two payments with the amount set
    (2,
     format('{"reportingRequirementId": 1, "adjustedGrossAmount": 123.45, "adjustedNetAmount": 1}')::jsonb,
     'create',
     'pending',
     'cif',
     'payment',
     null,
     1,
     'payment',
     '[]'),
    (3,
     format('{"reportingRequirementId": 1, "adjustedGrossAmount": 111.11, "adjustedNetAmount": 2}')::jsonb,
     'create',
     'pending',
     'cif',
     'payment',
     null,
     1,
     'payment',
     '[]'),
    -- One payment with the amount not set
    (4,
     format('{"reportingRequirementId": 1 }')::jsonb,
     'create',
     'pending',
     'cif',
     'payment',
     null,
     1,
     'payment',
     '[]'),
    -- One payment form_change that is to be archived
    (5,
     format('{"reportingRequirementId": 1, "adjustedGrossAmount": 99999, "adjustedNetAmount": 99999}')::jsonb,
     'archive',
     'pending',
     'cif',
     'payment',
     null,
     1,
     'payment',
     '[]'),
     -- One payment belonging to another revision / reporting requirement
    (6,
     format('{"reportingRequirementId": 2, "adjustedGrossAmount": 99999, "adjustedNetAmount": 99999}')::jsonb,
     'create',
     'pending',
     'cif',
     'payment',
     null,
     2,
     'payment',
     '[]');



select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_net_payment_amount((select * from record))
  ),
  3.0,
  'Returns the sum of the adjusted net amounts, only for the specified revision, non-archived form_changes'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select * from cif.project_revision_net_payment_amount((select * from record))
  ),
  null,
  'Returns null when there are no payments'
);

select finish();

rollback;
