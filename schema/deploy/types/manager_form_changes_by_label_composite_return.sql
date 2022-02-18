-- Deploy cif:types/manager_form_changes_by_label_composite_return to pg
-- requires: schemas/main

begin;

create type cif.manager_form_changes_by_label_composite_return as (
  label text,
  form_change_id integer,
  new_form_data jsonb
);

comment on type cif.manager_form_changes_by_label_composite_return is 'The type of change operation, defining the action taken when the form_change is committed.';

commit;
