begin;

select plan(3);

/** SETUP **/

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'),(2, 'pending'), (3, 'pending');

-- funding parameter with no proponent cost and no total project value
insert into cif.form_change(
  id,
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  change_status,
  json_schema_name,
  project_revision_id
)
overriding system value
values
(1,
json_build_object(
    'projectId', 1
    ),
'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', 1);

-- funding parameter with total project value but no proponent cost
insert into cif.form_change(
  id,
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  change_status,
  json_schema_name,
  project_revision_id
)
overriding system value
values
(2,
json_build_object(
    'projectId', 1,
    'maxFundingAmount', 5
    ),
'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', 2);

-- funding parameter with both total project value and proponent cost
insert into cif.form_change(
  id,
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  change_status,
  json_schema_name,
  project_revision_id
)
overriding system value
values
(
  3,
  json_build_object(
    'projectId', 3,
    'maxFundingAmount', 30,
    'proponentCost', 10
    ),
'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', 3);
/** SETUP END **/


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    ) select cif.form_change_proponents_share_percentage((select * from record))
  ),
  (
    null
  ),
  'Proponents share percentage is null when none of the values used in the calculation are provided'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select cif.form_change_proponents_share_percentage((select * from record))
  ),
  (
    null
  ),
  'Proponents share percentage is null when proponent cost is not provided'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=3
    ) select cif.form_change_proponents_share_percentage((select * from record))
  ),
  (
    25::numeric
  ),
  'Proponents share percentage is correctly calculated'
);

select finish();

rollback;
