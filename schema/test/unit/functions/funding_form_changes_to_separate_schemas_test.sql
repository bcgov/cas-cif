begin;

select plan(4);

-- test setup

select cif.create_project(1);
select cif.create_project(1);
select cif.create_project(2);
select cif.create_project(2);
select cif.create_project(2);


update cif.form_change
  set operation='archive'
  where id=1;

update cif.form_change
  set operation='archive'
  where id=3;

-- test setup ends

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
  (select count(*) from cif.form_change where json_schema_name='funding_parameter_EP'),
  2::bigint,
  'All EP projects have had their funding_parameter json_schema_name changed to funding_parameter_EP'
);

select is(
  (select count(*) from cif.form_change where json_schema_name='funding_parameter_IA'),
  3::bigint,
  'All IA projects have had their funding_parameter json_schema_name changed to funding_parameter_IA'
);


select finish();

rollback;
