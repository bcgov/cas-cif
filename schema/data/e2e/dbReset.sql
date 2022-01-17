begin;

-- cif.cif_user should not be truncated or else all tables should be (since they all have a created_by column)
truncate table
cif.form_change, cif.project_revision, cif.project, cif.project_manager, cif.operator
restart identity;


commit;
