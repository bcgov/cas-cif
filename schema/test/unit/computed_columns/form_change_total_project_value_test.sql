begin;

select plan(3);

/** SETUP **/

truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
truncate cif.project_revision restart identity cascade;
truncate cif.form_change restart identity cascade;
insert into cif.operator (legal_name) values ('test operator');

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'),(2, 'pending'), (3, 'pending');

-- funding parameter without max funding amount and proponent cost
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

-- funding parameter with max funding amount, proponent cost and additional funding sources
insert into cif.form_change(id,
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
  2,
  json_build_object(
    'projectId', 2,
    'maxFundingAmount', 200000,
    'proponentCost', 150000,
    'additionalFundingSources', json_build_array(
      json_build_object(
        'source', 'cheese import taxes-1',
        'amount', 1000,
        'status', 'Awaiting Approval'
      ),
      json_build_object(
    'source', 'cheese export taxes-2',
    'amount', 2000,
    'status', 'Approved'
      ),
      json_build_object(
          'source', 'cheese import taxes-3',
          'amount', 3000,
          'status', 'Approved'
      ),
      json_build_object(
          'source', 'cheese export taxes-4',
          'amount', 4000,
          'status', 'Denied'
      )
    )
  ),
'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', 2);

-- funding parameter with max funding amount and proponent cost but no additional funding sources
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
    'maxFundingAmount', 300000,
    'proponentCost', 200000
    ),
'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', 3);

/** END SETUP **/

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=1
    ) select * from cif.form_change_total_project_value((select * from record))
  ),
  0::numeric,
  'Returns zero if proponent cost, max funding amount and additional funding sources are missing'
);

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=2
    ) select * from cif.form_change_total_project_value((select * from record))
  ),
  355000::numeric,
  'Returns sum of proponent cost and max funding amount and additional funding sources with status Approved'
);

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=3
    ) select * from cif.form_change_total_project_value((select * from record))
  ),
  500000::numeric,
  'Returns sum of proponent cost and max funding amount when additional funding sources are missing'
);

select finish();

rollback;
