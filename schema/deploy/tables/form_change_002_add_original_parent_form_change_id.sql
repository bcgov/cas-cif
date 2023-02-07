-- Deploy cif:tables/form_change_002_add_original_parent_form_change_id to pg

begin;

alter table cif.form_change add column original_parent_form_change_id integer references cif.form_change(id);

comment on column cif.form_change.original_parent_form_change_id is 'The form_change id of the original parent of the record.';

commit;

