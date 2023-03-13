begin;

select plan(6);

-- test setup

truncate table cif.project restart identity cascade;

select cif.create_project(1); --EP 2019
select cif.create_project(2); --EP 2020
select cif.create_project(3); --EP 2021
select cif.create_project(5); --IA 2021
select cif.create_project(6); --IA 2022


-- add funding parameter form as we already removed it from the schema by a previous migration but this is needed for the test and fixing the migration
insert into cif.form(slug, json_schema, description) values ('funding_parameter', '{}'::jsonb, 'funding_parameter description');

-- add funding parameter form_change records
do $$
  begin
    for index in 1..5 loop
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
          'projectId', index,
          'maxFundingAmount', 200000,
          'proponentCost', 150000
          ),
      'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter', index),
      (
      json_build_object(

        'reportDueDate', now(),
        'submittedDate', now(),
        'projectId', index,
        'reportType', 'Annual',
        'reportingRequirementIndex',1
        ),
      'create', 'cif', 'reporting_requirement', 'pending', 'reporting_requirement',index),
      (
      json_build_object(
          'projectId', index,
          'sourceIndex', 1,
          'source', 'cheese import taxes',
          'amount', 1000,
          'status', 'Awaiting Approval'
        ),
      'create', 'cif', 'additional_funding_source', 'pending', 'funding_parameter',index);
    end loop;
  end;
$$;

update cif.form_change
  set operation='archive'
  where id=1;

update cif.form_change
  set operation='archive'
  where id=3;

-- test setup ends

select is(
  (select count(*) from cif.form_change where json_schema_name='funding_parameter' and form_data_table_name='funding_parameter'),
  5::bigint,
  'There are 5 form_change records with a json_schema_name of funding_parameter'
);

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.funding_form_changes_to_separate_schemas();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;


select is(
  (select count(*) from cif.form_change where json_schema_name='funding_parameter'),
  0::bigint,
  'There are no form_change records with a json_schema_name of funding_parameter'
);


select is (
  (select count(*) from cif.form where slug='funding_parameter'),
  0::bigint,
  'The funding_parameter json_schema_name has been removed from the form table'
);

select is(
  (select count(*) from cif.form_change where json_schema_name='funding_parameter_EP' and form_data_table_name='funding_parameter'),
  3::bigint,
  'All EP projects have had their funding_parameter json_schema_name changed to funding_parameter_EP'
);

select is(
  (select count(*) from cif.form_change where json_schema_name='funding_parameter_IA' and form_data_table_name='funding_parameter'),
  2::bigint,
  'All IA projects have had their funding_parameter json_schema_name changed to funding_parameter_IA'
);

select is(
  (select count(*) from cif.form_change where json_schema_name='reporting_requirement'),
  5::bigint,
  'There are 5 form_change records with a json_schema_name of reporting_requirement to make sure they are not affected by the migration'
);

select finish();

rollback;
