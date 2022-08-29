
begin;

select plan(5);

-- Test Setup
truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
select cif.create_project();
select cif.add_milestone_to_revision((select id from cif.project_revision order by id desc limit 1), 1);

-- it inserts a new record
select is(
  (select count(*) from cif.form_change
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
  and form_data_table_name in ('reporting_requirement', 'milestone_report', 'payment')),
  3::bigint,
  'There should be form_change records created for reporting_requirement, milestone_report and payment'
);

-- it returns three form_change records, one for each of the reporting_requirement, milestone_report and payment tables.
select set_eq(
  $$
    select project_revision_id, form_data_table_name
    from cif.add_milestone_to_revision((select id from cif.project_revision order by id desc limit 1), 2)
  $$,
  $$
    values (1::bigint, 'reporting_requirement'::varchar), (1::bigint, 'milestone_report'::varchar), (1::bigint, 'payment'::varchar)
  $$,
  'Three newly inserted records should be returned for the correct revision'
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
  for temp_row in select * from cif.form_change
    where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
    and form_data_table_name in ('reporting_requirement', 'milestone_report', 'payment')
  loop
    perform cif_private.commit_form_change_internal((temp_row.*)::cif.form_change);
  end loop;
end;
$$;

select isnt_empty (
  $$
    select id from cif.milestone_report where reporting_requirement_id = 1
  $$,
  'A record was successfully created in the corresponding table for the milestone_report form change record'
);

select isnt_empty (
  $$
    select * from cif.payment where reporting_requirement_id = 1
  $$,
  'A record was successfully created in the corresponding table for the payment form change record'
);

select isnt_empty (
  $$
    select * from cif.reporting_requirement where project_id = 1
  $$,
  'A record was successfully created in the corresponding table for the reporting_requirement form change record'
);

select finish();


rollback;
