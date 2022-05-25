


begin;

select plan(3);

/** SETUP **/
truncate table cif.change_status restart identity cascade;

insert into cif.change_status (status, triggers_commit, active)
values
  ('pending', false, true);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.form_change(id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, json_schema_name, new_form_data)
  overriding system value
  values
    (
      1,
      'create',
      'cif',
      'reporting_requirement',
      1,
      1,
      'reporting_requirement',
      '{
        "reportDueDate":"2002-02-20T12:00:01-07",
        "completionDate":"2003-02-21T12:00:01-07",
        "submittedDate":"2004-02-22T12:00:01-07",
        "status": "completed",
        "comments": "I am a comment",
        "certifiedBy": "Superman",
        "certifiedByProfessionalDesignation":"Super Hero",
        "projectId": 1,
        "reportType": "General Milestone",
        "reportingRequirementIndex": 123
      }'
    ),
    (2, 'create', 'cif', 'operator', 1, 1, 'operator', '{"legalName": "I am an operator"}');
/** SETUP END **/


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    ) select pg_typeof(cif.form_change_as_reporting_requirement((select * from record)))::text
  ),
  (
    'cif.reporting_requirement'::text
  ),
  'Returns a record of type reporting_requirement'
);

select results_eq(
  $$
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    )
    select
      id,
      report_due_date,
      completion_date,
      submitted_date,
      status,
      comments,
      certified_by,
      certified_by_professional_designation,
      project_id,
      report_type,
      reporting_requirement_index
    from cif.form_change_as_reporting_requirement((select * from record))
  $$,
  $$
    values (
      -1,
      '2002-02-20T12:00:01-07'::timestamptz,
      '2003-02-21T12:00:01-07'::timestamptz,
      '2004-02-22T12:00:01-07'::timestamptz,
      'completed'::varchar,
      'I am a comment'::varchar,
      'Superman'::varchar,
      'Super Hero'::varchar,
      1::int,
      'General Milestone'::varchar,
      123::int
      )
  $$,
  'Returns a record populated with the data from the form_change''s new_form_data field, and id of -1'
);


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select id from cif.form_change_as_reporting_requirement((select * from record))
  ),
  null,
  'Returns null when passed a form_change record with a form_data_table_name that is not reporting_requirement'
);


select finish();

rollback;
