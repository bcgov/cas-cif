-- Revert cif:migrations/005_attachment_data_into_project_attachment_table.sql from pg

begin;

update cif.attachment a
set project_id = (
  select (new_form_data ->> 'projectId')::integer
  from cif.form_change fc
  where (fc.new_form_data ->> 'attachmentId')::integer = a.id
);

commit;
