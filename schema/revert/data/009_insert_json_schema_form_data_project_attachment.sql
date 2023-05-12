-- Revert cif:data/009_insert_json_schema_form_data_project_attachment from pg

begin;

delete from cif.form_change where json_schema_name='project_attachment';
delete from cif.form where slug='project_attachment';

commit;
