

begin;


select plan(3);


-- Test Setup --

truncate table cif.project restart identity cascade;
truncate table cif.attachment restart identity cascade;
truncate table cif.operator restart identity cascade;

-- Just for testing since we are dropping these columns
alter table cif.attachment add column if not exists project_id integer references cif.project(id);
alter table cif.attachment add column if not exists project_status_id integer references cif.project_status(id);

insert into cif.operator(id, legal_name) overriding system value values (1, 'Test Operator');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1'),
  (1, 1, 1, '2000-RFP-2-123-ABCD', 'summary', 'project 2'),
  (1, 1, 1, '2000-RFP-3-123-ABCD', 'summary', 'project 3');

insert into cif.attachment (id, description, file_name, file_type, file_size, project_id) overriding system value
values
  (1, 'description1', 'file_name1', 'file_type1', 100, 1),
  (2, 'description2', 'file_name2', 'file_type2', 200, 2),
  (3, 'description3', 'file_name3', 'file_type3', 300, 3),
  (4, 'description4', 'file_name4', 'file_type4', 400, 2),
  (5, 'description5', 'file_name5', 'file_type5', 500, 1);

-- End Test Setup --

select cif_private.migration_attachment_table_to_project_attachment_table();

-- It creates a project_attachment record for each attachment record
select results_eq(
  $$
    select project_id, attachment_id from cif.project_attachment order by project_id, attachment_id;
  $$,
  $$
    select project_id, id from cif.attachment order by project_id, id;
  $$,
  'It creates a project_attachment record for each attachment record'
);

select is(
  (select count(*) from cif.project_attachment pa join cif.attachment a on pa.attachment_id = a.id where pa.project_id = a.project_id),
  (select count(*) from cif.attachment),
  'all attachment ids match project attachment ids'
);

-- function is idempotent
select cif_private.migration_attachment_table_to_project_attachment_table();

select is(
  (select count(*) from cif.project_attachment),
  (select count(*) from cif.attachment),
  'function is idempotent'
);

select finish();

rollback;
