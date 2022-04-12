-- TODO add testing for attachment table


begin;

select plan(15);

select has_table('cif', 'attachment', 'table cif.attachment exists');

select has_column('cif', 'attachment', 'id', 'table cif.attachment has id column');
select has_column('cif', 'attachment', 'file', 'table cif.attachment has file column');
select has_column('cif', 'attachment', 'description', 'table cif.attachment has description column');
select has_column('cif', 'attachment', 'file_name', 'table cif.attachment has file_name column');
select has_column('cif', 'attachment', 'file_type', 'table cif.attachment has file_type column');
select has_column('cif', 'attachment', 'file_size', 'table cif.attachment has file_size column');
select has_column('cif', 'attachment', 'project_id', 'table cif.attachment has project_id column');
select has_column('cif', 'attachment', 'project_status_id', 'table cif.attachment has project_status_id column');

select has_column('cif', 'attachment', 'created_at', 'table cif.attachment has created_at column');
select has_column('cif', 'attachment', 'updated_at', 'table cif.attachment has updated_at column');
select has_column('cif', 'attachment', 'archived_at', 'table cif.attachment has archived_at column');
select has_column('cif', 'attachment', 'created_by', 'table cif.attachment has created_by column');
select has_column('cif', 'attachment', 'updated_by', 'table cif.attachment has updated_by column');
select has_column('cif', 'attachment', 'archived_by', 'table cif.attachment has archived_by column');

select finish();

rollback;
