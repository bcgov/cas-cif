begin;

select plan(3);

/** SETUP **/

truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
insert into cif.operator (legal_name) values ('test operator');

select cif.create_project(1);
select cif.create_project(2);
select cif.create_project(3);

-- funding parameter without max funding amount and proponent cost
insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  change_status,
  json_schema_name,
  project_revision_id
)
values
(
json_build_object(
    'projectId', 1
    ),
'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', 1);

-- funding parameter with max funding amount, proponent cost and additional funding sources
insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  change_status,
  json_schema_name,
  project_revision_id
)
values
(
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
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  change_status,
  json_schema_name,
  project_revision_id
)
values
(
json_build_object(
    'projectId', 3,
    'maxFundingAmount', 300000,
    'proponentCost', 200000
    ),
'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', 3);

/** END SETUP **/

-- select '------';
-- with additional_funding_sources as (
--       select jsonb_array_elements(
--         (select (new_form_data ->> 'additionalFundingSources')
--         from cif.form_change fc
--         where fc.project_revision_id = 2
--         and fc.form_data_table_name = 'funding_parameter'
--         -- and fc.new_form_data ->> 'status' = 'Approved'
--         and operation != 'archive'
--         )::jsonb
--       )
--     )
--     -- select * from additional_funding_sources;
--     select ('amount') from additional_funding_sources;
    -- select '------';

-- with additional_funding_sources as (
--       select jsonb_to_recordset(
--         (select (new_form_data ->> 'additionalFundingSources')
--         from cif.form_change fc
--         where fc.project_revision_id = 2
--         and fc.form_data_table_name = 'funding_parameter'
--         -- and fc.new_form_data ->> 'status' = 'Approved'
--         and operation != 'archive'
--         )::jsonb
--       ) as x(amount int, status text, name text)
--     )
--     select * from additional_funding_sources;
--     -- select ('amount') from additional_funding_sources;
    select '------';


select * from jsonb_to_recordset(
        (select (new_form_data ->> 'additionalFundingSources')
        from cif.form_change fc
        where fc.project_revision_id = 2
        and fc.form_data_table_name = 'funding_parameter'
        and operation != 'archive'
        )::jsonb
      ) as x(source text, amount int, status text);



select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_total_project_value((select * from record))
  ),
  0::numeric,
  'Returns zero if proponent cost, max funding amount and additional funding sources are missing'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select * from cif.project_revision_total_project_value((select * from record))
  ),
  355000::numeric,
  'Returns sum of proponent cost and max funding amount and additional funding sources with status Approved'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select * from cif.project_revision_total_project_value((select * from record))
  ),
  500000::numeric,
  'Returns sum of proponent cost and max funding amount when additional funding sources are missing'
);

select finish();

rollback;
