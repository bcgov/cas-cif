-- Revert cif:tables/form_change_002_add_original_parent_form_change_id from pg

begin;

alter table cif.form_change drop column original_parent_form_change_id;

commit;
