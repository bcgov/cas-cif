
begin;

select plan(3);

-- Test Setup
truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
select cif.create_project(1);

insert into cif.attachment (description, file_name, file_type, file_size)
values
  ('description1', 'file_name1', 'file_type1', 100),
  ('description2', 'file_name2', 'file_type2', 100),
  ('description3', 'file_name3', 'file_type3', 100);

select cif.add_project_attachment_to_revision(1, 1, (select id from cif.project_revision order by id desc limit 1));

-- End Test Setup

select is(
  (select count(*) from cif.form_change
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
  and form_data_table_name = 'project_attachment'),
  1::bigint,
  'There should be form_change records created for project_attachment'
);

select set_eq(
  $$
    select project_revision_id, (new_form_data ->> 'projectId')::integer as project_id, (new_form_data ->> 'attachmentId')::integer as attachment_id
    from cif.add_project_attachment_to_revision(1, 2, (select id from cif.project_revision order by id desc limit 1))
  $$,
  $$
    values (1, 1, 2)
  $$,
  'newly inserted record should be returned for the correct revision'
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
    and form_data_table_name = 'project_attachment'
  loop
    perform cif_private.commit_form_change_internal((temp_row.*)::cif.form_change);
  end loop;
end;
$$;

select isnt_empty (
  $$
    select id from cif.project_attachment where project_id = 1 and attachment_id = 2
  $$,
  'A record was successfully created in the corresponding table for the project_attachment form change record'
);

select finish();


rollback;
