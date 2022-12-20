
begin;

select plan(4);

-- Test Setup
truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
select cif.create_project(1);
select cif.add_emission_intensity_report_to_revision((select id from cif.project_revision order by id desc limit 1));

-- it inserts a new record
select is(
  (select count(*) from cif.form_change
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
  and form_data_table_name in ('reporting_requirement', 'emission_intensity_report')),
  2::bigint,
  'There should be form_change records created for reporting_requirement, and emission_intensity_report'
);

-- it returns two form_change records, one for each of the reporting_requirement and emission_intensity_report tables.
select set_eq(
  $$
    select project_revision_id, form_data_table_name, (new_form_data ->> 'emissionFunctionalUnit')::text
    from cif.add_emission_intensity_report_to_revision((select id from cif.project_revision order by id desc limit 1))
  $$,
  $$
    values (1::bigint, 'reporting_requirement'::varchar, null ), (1::bigint, 'emission_intensity_report'::varchar, 'tCO2e'::text )
  $$,
  'Two newly inserted records should be returned for the correct revision'
);

-- Commit the form_change records to populate the related tables with data
insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1');

do
$$
declare
  temp_row cif.form_change;
begin
  for temp_row in select *
    from cif.form_change
    where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
    and form_data_table_name in ('reporting_requirement', 'emission_intensity_report')
  loop
    perform cif_private.commit_form_change_internal((temp_row.*)::cif.form_change);
  end loop;
end;
$$;

select isnt_empty (
  $$
    select id from cif.emission_intensity_report where reporting_requirement_id = 1
  $$,
  'A record was successfully created in the corresponding table for the emission_intensity_report form change record'
);


select isnt_empty (
  $$
    select * from cif.reporting_requirement where project_id = 1
  $$,
  'A record was successfully created in the corresponding table for the reporting_requirement form change record'
);

select finish();


rollback;
