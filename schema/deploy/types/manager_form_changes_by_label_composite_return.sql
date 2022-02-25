-- Deploy cif:types/manager_form_changes_by_label_composite_return to pg
-- requires: schemas/main

begin;

create type cif.manager_form_changes_by_label_composite_return as (
  project_manager_label cif.project_manager_label,
  form_change cif.form_change
);

comment on type cif.manager_form_changes_by_label_composite_return is 'A composite return type for the project_revision_project_manager_form_changes_by_label computed column. Returns a record for each active label and the last related form_change if it exists.';

commit;
