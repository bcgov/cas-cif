
begin;

select plan(6);

/***** SETUP *****/
insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.form_change(id, new_form_data, operation, form_data_schema_name, form_data_table_name, project_revision_id, json_schema_name)
  overriding system value
  values
    (1, '{"reportType":"Quarterly","comments":"submitted quarterly record", "reportDueDate":"2002-02-20T12:00:01-07", "submittedDate":"2002-02-20T12:00:01-07"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (2, '{"reportType":"Quarterly","comments":"due quarterly record", "reportDueDate":"2003-02-20T12:00:01-07"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (3, '{"reportType":"Quarterly","comments":"next due quarterly record", "reportDueDate":"2004-02-20T12:00:01-07"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (4, '{"reportType":"Annual","comments":"due annual record", "reportDueDate":"2000-02-20T12:00:01-07"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (5, '{"reportType":"Annual","comments":"next due annual record", "reportDueDate":"2006-02-20T12:00:01-07"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (6, '{"reportType":"General Milestone","comments":"I am a milestone", "reportDueDate":"2006-02-20T12:00:01-07"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (7, '{"reportType":"Performance Milestone","comments":"I am the next due milestone", "reportDueDate":"2005-02-20T12:00:01-07"}','create', 'cif', 'reporting_requirement', 1, 'reporting_requirement'),
    (8, '{"reportType":"Performance Milestone","comments":"I am an archived performance milestone", "reportDueDate":"1999-02-20T12:00:01-07"}','archive', 'cif', 'reporting_requirement', 1, 'reporting_requirement');


/***** END SETUP *****/

-- returns the earliest form_change without a submitted_date when no report_type is specified
select is(
  (
    with record as (
    select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1
    ) select id from cif.project_revision_upcoming_reporting_requirement_form_change((select * from record))
  ),
  (
    4
  ),
  'Returns the earliest form_change without a submitted_date when no report_type is specified and not returning the archived record'
);


-- returns the earliest form_change of that type without a submitted_date when the report_type is specified
select is(
  (
    with record as (
    select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1
    ) select id from cif.project_revision_upcoming_reporting_requirement_form_change((select * from record), 'Quarterly')
  ),
  (
    2
  ),
  'Returns the earliest form_change of that type without a submitted_date when the report_type is specified'
);



-- returns null when all reports of that type are submitted and the report_type is specified
update cif.form_change set new_form_data = new_form_data || '{"submittedDate":"2002-02-20T12:00:01-07"}' where id in (2,3);
select is(
  (
    with record as (
    select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1
    ) select id from cif.project_revision_upcoming_reporting_requirement_form_change((select * from record), 'Quarterly')
  ),
  (
    null
  ),
  'Returns null when all reports of that type are submitted and the report_type is specified'
);

with record as (
    select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1
    ) select * from cif.project_revision_upcoming_reporting_requirement_form_change((select * from record), 'Milestone');

-- returns null when no form_changes are present
select is(
  (
    with record as (
    select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1
    ) select id from cif.project_revision_upcoming_reporting_requirement_form_change((select * from record), 'Milestone')
  ),
  (
    7
  ),
  'Returns the next milestone report due when passed Milestone as a parameter'
);

-- returns null when all reports have been submitted and no report_type is specified
update cif.form_change set new_form_data = new_form_data || '{"submittedDate":"2002-02-20T12:00:01-07"}' where id in (4,5,6,7);
select is(
  (
    with record as (
    select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1
    ) select id from cif.project_revision_upcoming_reporting_requirement_form_change((select * from record))
  ),
  (
    null
  ),
  'Returns null when all reports have been submitted and no report_type is specified'
);

-- returns null when no form_changes are present
select is(
  (
    with record as (
    select row(project_revision.*)::cif.project_revision
    from cif.project_revision where id=1
    ) select id from cif.project_revision_upcoming_reporting_requirement_form_change((select * from record), 'Test Reporting Requirement')
  ),
  (
    null
  ),
  'Returns the latest form_change of that type when all reports of that type are submitted and the report_type is specified'
);

select finish();

rollback;
